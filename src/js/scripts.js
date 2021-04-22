const lists = document.querySelectorAll(".quizzes");
const homeScreenElement = document.querySelector(".homeScreen");
const quizzInsideScreenElement = document.querySelector(".quizzInsideScreen");
const createQuizzScreenElement = document.querySelector(".createQuizzScreen");

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
}

function getOneQuizz(quizzID) {
    const request = axios.get(`https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes/${quizzID}`);

    request.then(openQuizz);
    request.catch(gettingOneQuizError);
}

function openQuizz(response) {
    let selectedQuizz = response.data;
    console.log(selectedQuizz);
    let finalHTML = `<div class='quizzHeader'><p>${selectedQuizz.title}</p></div><div class='quizzContent'>`;
    for (let i=0; i<selectedQuizz.questions.length; i++) {
        finalHTML += `<ul class='quizzQuestion'><li><p>${selectedQuizz.questions[i].title}</p></li>`;
        let answers = selectedQuizz.questions[i].answers;
        console.log(answers);
        shuffleAnswers(answers);
        for (let j=0; j<answers.length; j++) {
            finalHTML += `<li><p>${answers[j].text}</p></li>`
        }
        finalHTML += `</ul>`
        document.querySelector('.quizzInsideScreen').innerHTML = finalHTML;
    }
    document.querySelector('.quizzHeader').style.backgroundImage = `linear-gradient(0deg, rgba(0, 0, 0, 0.57), rgba(0, 0, 0, 0.57)), url(${selectedQuizz.image})`;
    document.querySelector('.quizzInsideScreen').innerHTML += `</div>`;
}

function gettingOneQuizError(answer) {
    alert(`Erro ao tentar recuperar o quizz desejado! Status: ${answer.response.status}. Por favor, recarregue a página e tente de novo`);
}

function shuffleAnswers(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    console.log(array);
}

function clickedAnswer() {
    
}

function homeAndCreateScreenTransition(quizzID) {
    homeScreenElement.classList.toggle("hiddingClass");
    createQuizzScreenElement.classList.toggle("hiddingClass");
}