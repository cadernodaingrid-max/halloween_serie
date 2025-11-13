function formatarRegistro(registro, tipo) {
    if (!registro) return '';
    
    const cargas = registro.cargas_kg || 'N/D';
    const tecnica = registro.tecnica || 'N/D';
    const reps = Array.isArray(registro.repeticoes) ? registro.repeticoes.join(', ') : (registro.repeticoes || 'N/D');

    return `* ${registro.data} - cargas: ${cargas}. técnica: ${tecnica}. repetições: ${reps}. (${tipo})`;
}

async function carregarBiSets() {
    const listaHTML = document.getElementById('listaExercicios');
    if (!listaHTML) {
        console.error("Erro Crítico: Elemento 'listaExercicios' não encontrado no HTML.");
        return;
    }

    const caminhoUrl = window.location.pathname;
    const nomeArquivo = caminhoUrl.substring(caminhoUrl.lastIndexOf('/') + 1, caminhoUrl.lastIndexOf('.'));
    const treinoKey = nomeArquivo; 

    try {
        const [estruturaBiSets, historico] = await Promise.all([

            fetch('estrutura_bi_sets.json').then(res => {
                if (!res.ok) throw new Error(`Erro ao carregar estrutura_bi_sets.json (Status: ${res.status}).`);
                return res.json();
            }),

            fetch('historico_exercicios.json').then(res => {
                if (!res.ok) throw new Error(`Erro ao carregar historico_exercicios.json (Status: ${res.status}).`);
                return res.json();
            })
        ]);
        
        const treinoEstrutura = estruturaBiSets[treinoKey];


        if (!treinoEstrutura || !treinoEstrutura.bi_sets || treinoEstrutura.bi_sets.length === 0) {
            listaHTML.innerHTML = `<p class="alerta-sem-registro">ALERTA CRÍTICO: Estrutura do Bi-Set (Chave: ${treinoKey}) não encontrada ou vazia no arquivo estrutura_bi_sets.json.</p>`;
            return;
        }


        const tituloElement = document.getElementById('tituloTreino');
        if (tituloElement) {
            tituloElement.textContent = treinoEstrutura.titulo;
        }
        
        document.title = treinoEstrutura.titulo;


        let htmlGerado = '';
        
        treinoEstrutura.bi_sets.forEach((biSet, biSetIndex) => {
            
            let groupType = 'Grupo';
            if (biSet.exercicios && biSet.exercicios.length === 1) {
                groupType = 'Single-Set';
            } else if (biSet.exercicios && biSet.exercicios.length === 2) {
                groupType = 'Bi-Set';
            } else if (biSet.exercicios && biSet.exercicios.length > 2) {
                groupType = 'Super-Set';
            }


            htmlGerado += `
                <div class="biset-container">
                    <h4>
                        ${biSet.nome || `${groupType} ${biSetIndex + 1}`}
                        <span class="tipo-grupo">(${groupType})</span>
                    </h4>
                    <p class="notas-bi-set observacao">${biSet.notas || 'Sem notas específicas para este grupo.'}</p>
                    
                    <!-- Container que o seu CSS tenta estilizar as LIs internas -->
                    <ul class="exercicios-lista-biset"> 
            `;
            
            (biSet.exercicios || []).forEach(nomeExercicio => {
                
                const historicoEx = historico[nomeExercicio] || [];
                historicoEx.sort((a, b) => {
                    const dateA = new Date(a.data.split('/').reverse().join('-'));
                    const dateB = new Date(b.data.split('/').reverse().join('-'));
                    return dateB - dateA;
                });
                
                const ultimoRegistro = historicoEx[0];
                const penultimoRegistro = historicoEx[1];
                
                const progressao = treinoEstrutura.progresso_esperado ? treinoEstrutura.progresso_esperado[nomeExercicio] : undefined;

                htmlGerado += `
                    <li>
                        <!-- Usamos uma div interna para agrupar o conteúdo e aplicar estilos de div, se necessário -->
                        <div class="exercicio-individual"> 
                            <h4>${nomeExercicio}</h4>
                `;

                if (ultimoRegistro) {
                    htmlGerado += `
                        <p class="historico-registro ultimo">
                            ${formatarRegistro(ultimoRegistro, 'Último Treino')}
                        </p>
                    `;
                } else {
                    htmlGerado += `<p class="alerta-sem-registro">*** ALERTA: Não há registro para este exercício. ***</p>`;
                }

                if (penultimoRegistro) {
                    htmlGerado += `
                        <p class="historico-registro penultimo">
                            ${formatarRegistro(penultimoRegistro, 'Penúltimo Treino')}
                        </p>
                    `;
                }

                if (progressao && progressao.trim() !== "") {
                    htmlGerado += `
                        <p class="alerta-progresso">
                            <span class="progresso-meta">META:</span> ${progressao}
                        </p>
                    `;
                } else {
                    htmlGerado += `<p class="alerta-progresso">*** ALERTA: Meta de progressão não definida para ${nomeExercicio}. ***</p>`;
                }

                htmlGerado += '</div>'; 
                htmlGerado += '</li>'; 
            });

            htmlGerado += '</ul>'; 
            htmlGerado += '</div>'; 
        });

    
        listaHTML.innerHTML = htmlGerado;

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        listaHTML.innerHTML = `
            <div class="alerta-sem-registro">
                <p><strong>Erro Crítico de Carregamento:</strong></p>
                <p>Não foi possível carregar os dados. Verifique a sintaxe dos arquivos JSON e se está rodando em um servidor local.</p>
                <p style="font-size: 0.8em; margin-top: 5px;">Detalhe Técnico: ${error.message}</p>
            </div>
        `;
    }
}

window.onload = carregarBiSets;
