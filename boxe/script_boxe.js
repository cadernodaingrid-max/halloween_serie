let indiceAtual = 0;
let elementoExercicio;
let elementoBotao;

// Função para exibir o exercício
function exibirExercicio(indice) {

    if (!elementoExercicio || !window.treino || window.treino.length === 0) return; 
    

    const texto = window.treino[indice]; 
    elementoExercicio.innerHTML = texto;
}

// Função para passar para o próximo
function proximoExercicio() {
    if (!elementoExercicio || !elementoBotao || !window.treino || window.treino.length === 0) return;

    if (indiceAtual < window.treino.length - 1) {
        indiceAtual++;
        exibirExercicio(indiceAtual);
        
        // Altera o texto do botão na primeira vez
        if (elementoBotao.textContent.trim().includes('DONE') || elementoBotao.textContent.trim().includes('INICIAR')) {
            elementoBotao.textContent = 'PRÓXIMO';
        }

    } else if (indiceAtual === window.treino.length - 1) {
        // Ao chegar no último item
        elementoExercicio.innerHTML = window.treino[indiceAtual];
        elementoBotao.style.display = 'none';
    }
}


document.addEventListener('DOMContentLoaded', (event) => {
    elementoExercicio = document.getElementById('exercicio-atual');
    elementoBotao = document.getElementById('proximo-btn');
    
    // Checagem de erro para a lista de exercícios
    if (!window.treino || !Array.isArray(window.treino) || window.treino.length === 0) {
        console.error("Erro: Array 'treino' não definido ou vazio no HTML.");
        document.body.innerHTML = '<h1 style="color:red; font-size: 5vw;">ERRO: O treino não foi carregado. Verifique a lista no HTML.</h1>';
        return;
    }
    
    if (elementoExercicio && elementoBotao) {
        exibirExercicio(indiceAtual);
    } else {
        console.error("Erro: Elementos 'exercicio-atual' ou 'proximo-btn' não encontrados.");
        document.body.innerHTML = '<h1 style="color:red; font-size: 5vw;">ERRO AO CARREGAR A PÁGINA. Por favor, verifique o código HTML.</h1>';
    }
});
