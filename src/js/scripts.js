history.scrollRestoration = "manual";

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

const lists = document.querySelectorAll(".quizzes");
const homeScreenElement = document.querySelector(".homeScreen");
const quizzInsideScreenElement = document.querySelector(".quizzInsideScreen");
const createQuizzScreenElement = document.querySelector(".createQuizzScreen");
let atualQuestion;
let newQuizz = {}
let numberOfQuestions = 0;
let numberOflevels = 0;
let newQuestions = [];

function temp() {
    console.log("Funciona! substituir!");
}

getAllQuizzes()

function getAllQuizzes() {
    const request = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes");

    request.then(renderWithAnswer);
    request.catch(gettingAllQuizzesError);
}

function renderWithAnswer(answer){
    renderQuizzes(answer.data);
}

function gettingAllQuizzesError(answer) {
    alert(`Erro ao tentar recuperar os Quizess! Status: ${answer.response.status}. Por favor, recarregue a página e tente de novo`);
}

function renderQuizzes(quizzesList) {
    resetQuizzesLists();
    quizzesList.forEach(renderQuizz);
}

function resetQuizzesLists() {
    lists[0].innerHTML= "";
    lists[1].innerHTML= "";
}

function renderQuizz(quizzInfo) {
    //TODO comparação com os ids dos meus quizz pra distribuir entre as listas
    lists[1].innerHTML += `
        <li id="${quizzInfo.id}" onclick="toQuizzInsideScreenTransition(${quizzInfo.id})">
            <p>${quizzInfo.title}</p>
        </li>
    `;
    document.getElementById(quizzInfo.id).style.backgroundImage = `
    linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(0, 0, 0, 0.5) 64.58%,
        #000000 100%
      ),
      url(${quizzInfo.image})
    `;
}

function toQuizzInsideScreenTransition(quizzID) {
    getOneQuizz(quizzID);
    homeScreenElement.classList.toggle("hiddingClass");
    quizzInsideScreenElement.classList.toggle("hiddingClass");
    window.scrollTo(0, 0);
}

function getOneQuizz(quizzID) {
    const request = axios.get(`https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes/${quizzID}`);

    request.then(openQuizz);
    request.catch(gettingOneQuizError);
}

function openQuizz(response) {
    let selectedQuizz = response.data;
    let finalHTML = `<div class='quizzHeader'><p>${selectedQuizz.title}</p></div><div class='quizzContent'>`;

    //IMPLEMENTAÇÃO DO HTML DA PÁGINA 2
    for (let i=0; i<selectedQuizz.questions.length; i++) {
        finalHTML += `<ul onclick="scrollPage(this)" class='quizzQuestion' id='question${i}'><li style='background-color: ${selectedQuizz.questions[i].color}'><p>${selectedQuizz.questions[i].title}</p></li>`;
        let answers = selectedQuizz.questions[i].answers;
        shuffleAnswers(answers);
        for (let j=0; j<answers.length; j++) {
            console.log(answers[j].isCorrectAnswer);
            finalHTML += `<li value=${answers[j].isCorrectAnswer} id='possibleAnswer' name='answer${j}'><img src='${answers[j].image}' width="330px" height="175px"><h1>${answers[j].text}</h1></li>`
        }
        finalHTML += `</ul>`
        document.querySelector('.quizzInsideScreen').innerHTML = finalHTML;
    }
    document.querySelector('.quizzHeader').style.backgroundImage = `linear-gradient(0deg, rgba(0, 0, 0, 0.57), rgba(0, 0, 0, 0.57)), url(${selectedQuizz.image})`;
    document.querySelector('.quizzInsideScreen').innerHTML += `</div>`;

    //IMPLEMENTAÇÃO DA FUNÇÃO QUE ALTERA A OPACIDADE DAS ALTERNATIVAS NÃO-SELECIONADAS & COLORE OS TEXTOS DAS ALTERNATIVAS
    let possibleAnswers = quizzInsideScreenElement.querySelectorAll('#possibleAnswer');
    console.log(possibleAnswers);
    for (let i=0; i<possibleAnswers.length; i++) {
        possibleAnswers[i].onclick = function() { 
            let answeredQuestion = this.parentElement.querySelectorAll('#possibleAnswer');
            let verifier = this;
            for (let k=0; k<answeredQuestion.length; k++) {
                console.log(answeredQuestion[k]);
                console.log(answeredQuestion[k].attributes.value);
                let greenOrRed = answeredQuestion[k].attributes.getNamedItem("value").value;
                if (greenOrRed == 'true') {
                    answeredQuestion[k].style.color = 'green';
                } else {
                    answeredQuestion[k].style.color = 'red';
                }
                if (answeredQuestion[k] == verifier) {}
                else if (answeredQuestion[k].name != `answer${possibleAnswers[i].name}`) {
                    answeredQuestion[k].classList.add('whiteShade');
                    answeredQuestion[k].onclick = null;
                }
            }
        }
    }
}


function gettingOneQuizError(answer) {
    alert(`Erro ao tentar recuperar o quizz desejado! Status: ${answer.response.status}. Por favor, recarregue a página e tente de novo`);
}

function shuffleAnswers(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    answers = array;
}


function scrollPage(question) {
    atualQuestion = question;
    setTimeout(scrollToNextQuestion, 2000)
}

function scrollToNextQuestion() {
    let nextPosition = atualQuestion.nextSibling.offsetTop - 50;
    let scrollOptions = {
        top: nextPosition,
        behavior: 'smooth'
    }
    window.scrollTo(scrollOptions);
}

function homeAndCreateScreenTransition() {
    homeScreenElement.classList.toggle("hiddingClass");
    createQuizzScreenElement.classList.toggle("hiddingClass");
}

function expandCollapseEffect(element) {
    element.children[1].classList.toggle("hiddingClass");
    element.parentElement.children[1].classList.toggle("hiddingClass")
}

function fromFirstStepsToCreateQuestions(element) {
    newQuizz.title = document.getElementsByName("quizzTitle")[0].value;
    //limpar campo
    newQuizz.image = document.getElementsByName("quizzImageURL")[0].value;
    //limpar campo
    numberOfQuestions = document.getElementsByName("numberOfQuestions")[0].value;
    //limpar campo
    numberOflevels = document.getElementsByName("numberOfLevels")[0].value;
    //limpar campo
    renderQuestions();
    renderLevels();
    document.querySelector(".firstSteps").classList.toggle("hiddingClass");
    document.querySelector(".createQuestions").classList.toggle("hiddingClass");

}

function renderQuestions() {
    const element = document.querySelector(".createQuestions");
    element.innerHTML = "<h1>Criar suas perguntas</h1>";
    for (let i = 0; i < numberOfQuestions; i++) {
        element.innerHTML += `
            <div id="${i+1}" class="createdQuestion">
                <div class="createdQuestionTitle" onclick="expandCollapseEffect(this)">
                    <p>Pergunta ${i+1}</p>
                    <ion-icon name="create-outline"></ion-icon>
                </div>
                <div class="inputFields hiddingClass">
                    <div class="inputPair">
                        <input class="questionText" type="text" required="required" placeholder="Texto da pergunta">
                        <input class="questionBGcolor" type="text" required="required" placeholder="Cor de fundo da pergunta">
                    </div>
                    <p>Resposta correta</p>
                    <div class="inputPair">
                        <input type="text" required="required" placeholder="Resposta Correta">
                        <input type="url" required="required" placeholder="URL da imagem">
                    </div>
                    <p>Respostas incorretas</p>
                    <div class="inputPair">
                        <input type="text" required="required" placeholder="Resposta incorreta 1">
                        <input type="url" required="required" placeholder="URL da imagem 1">
                    </div>
                    <div class="inputPair">
                        <input type="text" placeholder="Resposta incorreta 2">
                        <input type="url" placeholder="URL da imagem 2">
                    </div>
                    <div class="inputPair">
                        <input type="text" placeholder="Resposta incorreta 3">
                        <input type="url" placeholder="URL da imagem 3">
                    </div>
                </div>
            </div>
        `
        if(i===0) {
            expandCollapseEffect(element.children[1].children[0]); 
        }
    }
    element.innerHTML += `<button onclick="fromCreateQuestionsToCreateLevel(this)">Prosseguir pra criar níveis</button>`;
}

function renderLevels() {
    const element = document.querySelector(".createLevels");
    element.innerHTML = "<h1>Agora, decida os níveis</h1>";
    for (let i = 0; i < numberOflevels; i++) {
        element.innerHTML += `
            <div id="${i+1}" class="createdLevel">
                <div class="createdLevelTitle" onclick="expandCollapseEffect(this)">
                    <p>Nível ${i+1}</p>
                    <ion-icon name="create-outline"></ion-icon>
                </div>
                <div class="inputGroup hiddingClass">
                    <input name="levelTitle" type="text" required="required" placeholder="Título do nível">
                    <input name="levelMinimumPercentage" type="number" required="required" placeholder="% de acerto mínima">
                    <input name="quizzImageURL" type="url" required="required" placeholder="URL da imagem do nível">
                    <input name="levelDescription" type="text" required="required" placeholder="Descrição do nível">
                </div>
            </div>
        `
        if(i===0) {
            expandCollapseEffect(element.children[1].children[0]); 
        }
    }
    element.innerHTML += `<button onclick="fromCreateLevelsTosuccessfulCreated(this)">Finalizar Quizz</button>`;
}

function fromCreateQuestionsToCreateLevel(element) {
    //validações e recolhimento de inputs
    //const allQuestion = document.querySelectorAll(".createdQuestion");
    //allQuestion.forEach(getQuestion);
    //limpar campos
    document.querySelector(".createQuestions").classList.toggle("hiddingClass");
    document.querySelector(".createLevels").classList.toggle("hiddingClass");
}


function getQuestion(element, index) {
    let object = {};
    const answers = [];
    object.title = `Título da pergunta ${index+1}`;
    object.color = element.querySelector(".questionBGcolor").value;
    object.answers = getAnswers(element, answers);
    newQuestions.push(object);
    console.log(`Objeto ${index+1} gerado até então: ${newQuestions[index]}`);
}

function getAnswers(element, answers) {
    
    return answer
}


function fromCreateLevelsTosuccessfulCreated(element) {
    //validações e recolhimento de inputs
    ///post comm retorno do objeto
    // usar o objeto retornado pra renderizar o card de imagem do quizz recem cadastrado
    //limpar campo
    //talves seja uma boa ideia criar os elementos aqui pra incluir o id da quizz recen criado no onclik
    document.querySelector(".createLevels").classList.toggle("hiddingClass");
    document.querySelector(".successfulCreated").classList.toggle("hiddingClass");
}

function fromSuccessfulCreatedToHomeScreen() {
    document.querySelector(".successfulCreated").classList.toggle("hiddingClass");
    document.querySelector(".firstSteps").classList.toggle("hiddingClass");
    homeAndCreateScreenTransition()
}

function fromSuccessfulCreatedToQuizzInsideScreen(element) {
    //usar o id para fazer o get de um elemento e abrir a tela 2 com a renderização feita 
    document.querySelector(".successfulCreated").classList.toggle("hiddingClass");
    document.querySelector(".firstSteps").classList.toggle("hiddingClass");
    quizzInsideScreenElement.classList.toggle("hiddingClass");
}
