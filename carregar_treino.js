
function formatarRegistro(registro, tipo) {
    if (!registro) return '';
    
    const cargas = registro.cargas_kg || 'N/D';
    const tecnica = registro.tecnica || 'N/D';
    const reps = registro.repeticoes ? registro.repeticoes.join(', ') : 'N/D';

    return `* ${registro.data} - cargas: ${cargas}. técnica: ${tecnica}. repetições: ${reps}. (${tipo})`;
}

async function carregarTreino() {
    const caminhoUrl = window.location.pathname;
    const nomeArquivo = caminhoUrl.substring(caminhoUrl.lastIndexOf('/') + 1, caminhoUrl.lastIndexOf('.'));

    const nomeTreinoMap = {
        'treino_a': 'treino_a',
        'treino_b': 'treino_b',
        'treino_e': 'treino_e',
        'treino_d': 'treino_d',
        'treino_c': 'treino_c'  
    };
    const treinoKey = nomeTreinoMap[nomeArquivo] || nomeArquivo;

    try {
        const [estrutura, historico] = await Promise.all([
            fetch('estrutura_treinos.json').then(res => res.json()),
            fetch('historico_exercicios.json').then(res => res.json())
        ]);
        
        const treinoEstrutura = estrutura[treinoKey];
        const listaHTML = document.getElementById('listaExercicios');
        
        if (!treinoEstrutura) {
            listaHTML.innerHTML = `<p>ALERTA CRÍTICO: Estrutura do treino (${treinoKey}) não encontrada. Verifique o arquivo estrutura_treinos.json.</p>`;
            return;
        }

        document.getElementById('tituloTreino').textContent = treinoEstrutura.titulo;
        document.getElementById('pageTitle').textContent = treinoEstrutura.titulo;

        let htmlGerado = '';
        
        treinoEstrutura.exercicios.forEach(nomeExercicio => {
            const historicoEx = historico[nomeExercicio] || []; 
            const ultimoRegistro = historicoEx[0];
            const penultimoRegistro = historicoEx[1];
            const progressao = treinoEstrutura.progresso_esperado[nomeExercicio];

            htmlGerado += `
                <div>
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

          
            if (progressao) {
                htmlGerado += `
                    <p class="alerta-progresso">
                        *** PROGRESSÃO ESPERADA: ${progressao} ***
                    </p>
                `;
            } else {
                 htmlGerado += `<p class="alerta-progresso">*** ALERTA CRÍTICO: Meta de progressão não definida no estrutura_treinos.json. Defina uma meta. ***</p>`;
            }


            htmlGerado += '</div><hr>';
        });

        listaHTML.innerHTML = htmlGerado;

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        document.getElementById('listaExercicios').innerHTML = `<p>Erro crítico: Não foi possível carregar os dados de treino. Verifique se os arquivos JSON existem e estão corretos.</p>`;
    }
}

carregarTreino();
