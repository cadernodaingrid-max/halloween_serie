
function formatarRegistro(registro, tipo) {
    if (!registro) return '';
    
    const cargas = registro.cargas_kg || 'N/D';
    const tecnica = registro.tecnica || 'N/D';
    const reps = Array.isArray(registro.repeticoes) ? registro.repeticoes.join(', ') : (registro.repeticoes || 'N/D');

    return `* ${registro.data} - cargas: ${cargas}. técnica: ${tecnica}. repetições: ${reps}. (${tipo})`;
}

async function carregarBiSets() {
    const caminhoUrl = window.location.pathname;
    const nomeArquivo = caminhoUrl.substring(caminhoUrl.lastIndexOf('/') + 1, caminhoUrl.lastIndexOf('.'));
    const treinoKey = nomeArquivo;

    try {
        const [estruturaBiSets, historico] = await Promise.all([
            fetch('estrutura_bi_sets.json').then(res => res.json()),
            fetch('historico_exercicios.json').then(res => res.json())
        ]);
        
        const treinoEstrutura = estruturaBiSets[treinoKey];
        const listaHTML = document.getElementById('listaBiSets'); 

        if (!treinoEstrutura || !treinoEstrutura.bi_sets || treinoEstrutura.bi_sets.length === 0) {
            listaHTML.innerHTML = `<p class="alerta-sem-registro">ALERTA CRÍTICO: Estrutura do Bi-Set (${treinoKey}) não encontrada ou vazia no arquivo estrutura_bi_sets.json.</p>`;
            return;
        }

        document.getElementById('tituloTreino').textContent = treinoEstrutura.titulo;
        document.getElementById('pageTitle').textContent = treinoEstrutura.titulo;

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


            // Container principal para o Grupo
            htmlGerado += `
                <div class="bi-set-container bg-white p-6 rounded-xl shadow-lg mb-8">
                    <h3 class="text-2xl font-extrabold text-indigo-700 border-b pb-2 mb-4">
                        ${biSet.nome || `${groupType} ${biSetIndex + 1}`}
                    </h3>
                    <p class="text-sm italic text-gray-600 mb-4">${biSet.notas || 'Sem notas específicas para este grupo.'}</p>
            `;
            
            (biSet.exercicios || []).forEach(nomeExercicio => {
                
                const historicoEx = historico[nomeExercicio] || [];
                historicoEx.sort((a, b) => new Date(b.data) - new Date(a.data));
                
                const ultimoRegistro = historicoEx[0];
                const penultimoRegistro = historicoEx[1];
                
                const progressao = treinoEstrutura.progresso_esperado && treinoEstrutura.progresso_esperado[nomeExercicio];

                // Bloco do Exercício Individual
                htmlGerado += `
                    <div class="exercicio-individual p-4 border-l-4 border-green-500 mb-4 bg-gray-50 rounded-md">
                        <h4 class="text-xl font-semibold text-gray-800 mb-2">${nomeExercicio}</h4>
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

                if (progressao) {
                    htmlGerado += `
                        <p class="alerta-progresso mt-2">
                            <span class="font-bold">META:</span> ${progressao}
                            </p>
                    `;
                } else {
                    htmlGerado += `<p class="alerta-progresso mt-2">*** ALERTA: Meta de progressão não definida para ${nomeExercicio}. ***</p>`;
                }

                htmlGerado += '</div>'; 
            });

            htmlGerado += '</div>'; 
        });

        listaHTML.innerHTML = htmlGerado;

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        document.getElementById('listaBiSets').innerHTML = `<p class="alerta-sem-registro">Erro crítico: Não foi possível carregar os dados de Bi-Set. Verifique os arquivos JSON.</p>`;
    }
}

// Inicia o carregamento
window.onload = carregarBiSets;
