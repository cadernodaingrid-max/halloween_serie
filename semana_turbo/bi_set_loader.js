function formatarRegistro(registro, tipo) {
    if (!registro) return '';
    
    const cargas = registro.cargas_kg || 'N/D';
    const tecnica = registro.tecnica || 'N/D';
    const reps = Array.isArray(registro.repeticoes) ? registro.repeticoes.join(', ') : (registro.repeticoes || 'N/D');

    return `* ${registro.data} - cargas: ${cargas}. técnica: ${tecnica}. repetições: ${reps}. (${tipo})`;
}

async function carregarBiSets() {
    const listaHTML = document.getElementById('listaBiSets');
    if (!listaHTML) {
        console.error("Erro Crítico: Elemento 'listaBiSets' não encontrado no HTML. Verifique se o ID está correto.");
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
            fetch('../historico_exercicios.json').then(res => {
                if (!res.ok) throw new Error(`Erro ao carregar historico_exercicios.json (Status: ${res.status}).`);
                return res.json();
            })
        ]);
        
        const treinoEstrutura = estruturaBiSets[treinoKey];

        if (!treinoEstrutura || !treinoEstrutura.bi_sets || treinoEstrutura.bi_sets.length === 0) {
            listaHTML.innerHTML = `<p class="alerta-sem-registro text-red-600 p-4 bg-red-100 rounded-md">ALERTA CRÍTICO: Estrutura do Bi-Set (Chave: ${treinoKey}) não encontrada ou vazia no arquivo estrutura_bi_sets.json.</p>`;
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
                <div class="bi-set-container bg-white p-6 rounded-xl shadow-xl mb-8 border-t-8 border-indigo-500">
                    <h3 class="text-2xl font-extrabold text-indigo-700 border-b pb-2 mb-4">
                        ${biSet.nome || `${groupType} ${biSetIndex + 1}`}
                        <span class="text-sm font-normal text-indigo-400 ml-2">(${groupType})</span>
                    </h3>
                    <p class="text-sm italic text-gray-600 mb-4">${biSet.notas || 'Sem notas específicas para este grupo.'}</p>
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
                    <div class="exercicio-individual p-4 border-l-4 border-green-500 mb-4 bg-gray-50 rounded-md transition duration-300 hover:shadow-inner">
                        <h4 class="text-xl font-semibold text-gray-800 mb-2">${nomeExercicio}</h4>
                `;

                if (ultimoRegistro) {
                    htmlGerado += `
                        <p class="historico-registro text-sm text-gray-700 mb-1">
                            ${formatarRegistro(ultimoRegistro, 'Último Treino')}
                        </p>
                    `;
                } else {
                    htmlGerado += `<p class="alerta-sem-registro text-red-500 text-sm">*** ALERTA: Não há registro para este exercício. ***</p>`;
                }

                if (penultimoRegistro) {
                    htmlGerado += `
                        <p class="historico-registro text-xs text-gray-500 italic mb-3">
                            ${formatarRegistro(penultimoRegistro, 'Penúltimo Treino')}
                        </p>
                    `;
                }

                if (progressao && progressao.trim() !== "") {
                    htmlGerado += `
                        <p class="alerta-progresso mt-2 p-2 bg-yellow-100 border-l-2 border-yellow-500 rounded text-sm text-yellow-800">
                            <span class="font-bold">META:</span> ${progressao}
                        </p>
                    `;
                } else {
                    htmlGerado += `<p class="alerta-progresso mt-2 text-sm text-yellow-600 italic">*** ALERTA: Meta de progressão não definida para ${nomeExercicio}. ***</p>`;
                }

                htmlGerado += '</div>'; 
            });

            htmlGerado += '</div>'; 
        });

        
        listaHTML.innerHTML = htmlGerado;

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        listaHTML.innerHTML = `
            <div class="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-lg">
                <p class="font-bold mb-2 text-lg">Erro Crítico de Carregamento</p>
                <p>Não foi possível carregar os dados de Bi-Set. Verifique se os arquivos JSON (estrutura_bi_sets.json e historico_exercicios.json) existem nos caminhos corretos e se estão bem formatados.</p>
                <p class="mt-3 text-sm italic">Detalhe Técnico: ${error.message}</p>
            </div>
        `;
    }
}

window.onload = carregarBiSets;
