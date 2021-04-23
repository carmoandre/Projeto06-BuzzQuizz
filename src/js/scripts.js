history.scrollRestoration = "manual";

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

const lists = document.querySelectorAll(".quizzes");
const homeScreenElement = document.querySelector(".homeScreen");
const quizzInsideScreenElement = document.querySelector(".quizzInsideScreen");
const createQuizzScreenElement = document.querySelector(".createQuizzScreen");
let atualQuestion;
let selectedQuizz;
let quizzLevelsMinValues = [];
let quizzLevelsIds = [];
let possiblePoints = 0;
let score = 0;
let resultLevel;

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
    selectedQuizz = response.data;
    let finalHTML = `
    <div class='quizzHeader'>
        <p>${selectedQuizz.title}</p>
    </div>
    <div class='quizzContent'>`;

    //IMPLEMENTAÇÃO DO HTML DA PÁGINA 2
    for (let i=0; i<selectedQuizz.questions.length; i++) {
        finalHTML += `
        <ul onclick="scrollPage(this)" class='quizzQuestion' id='question${i}'>
            <li style='background-color: ${selectedQuizz.questions[i].color}'>
                <p>${selectedQuizz.questions[i].title}</p>
            </li>
            `;
        let answers = selectedQuizz.questions[i].answers;
        shuffleAnswers(answers);
        for (let j=0; j<answers.length; j++) {
            console.log(answers[j].isCorrectAnswer);
            finalHTML += `
            <li value=${answers[j].isCorrectAnswer} id='possibleAnswer' name='answer${j}'>
                <img src='${answers[j].image}' width="330px" height="175px">
                <h1>${answers[j].text}</h1>
            </li>
            `;
        }
        finalHTML += `</ul>`
    }
    for (let q=0; q<selectedQuizz.levels.length; q++) {
        finalHTML += `
        <ul class='quizzResult level${q} hiddingClass'>
            <li style='background-color: #EC362D'>
                <p id='resultScreenTitle'>${selectedQuizz.levels[q].title}</p>
            </li>
            <li>
                <img src='${selectedQuizz.levels[q].image}' width="364px" height="273px">
            </li>
            <li>
                <h1>${selectedQuizz.levels[q].text}</h1>
            </li>
        </ul>
        `;
        quizzLevelsIds.push(q);
        quizzLevelsMinValues.push(selectedQuizz.levels[q].minValue);
    }
    finalHTML += `</div>`;
    document.querySelector('.quizzInsideScreen').innerHTML = finalHTML;

    document.querySelector('.quizzHeader').style.backgroundImage = `
    linear-gradient(
            0deg, 
            rgba(0, 0, 0, 0.60), 
            rgba(0, 0, 0, 0.60)
        ), 
     url(${selectedQuizz.image})
    `;

    //IMPLEMENTAÇÃO DA FUNÇÃO QUE ALTERA A OPACIDADE DAS ALTERNATIVAS NÃO-SELECIONADAS & COLORE OS TEXTOS DAS ALTERNATIVAS
    let possibleAnswers = quizzInsideScreenElement.querySelectorAll('#possibleAnswer');
    for (let i=0; i<possibleAnswers.length; i++) {
        possibleAnswers[i].onclick = function() { 
            possiblePoints += 1;
            let answeredQuestion = this.parentElement.querySelectorAll('#possibleAnswer');
            let verifier = this;
            if (verifier.attributes.getNamedItem("value").value == 'true') {
                score += 1;
            }
            for (let k=0; k<answeredQuestion.length; k++) {
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
            if (possiblePoints == selectedQuizz.questions.length) {
                let percentualScore = ((score / possiblePoints) * 100);
                let stop = 0;
                for (let r=quizzLevelsMinValues.length-1; r>=0; r--) {
                    if (stop == 0) {
                        if (percentualScore >= quizzLevelsMinValues[r]) {
                            let correspondentResult = quizzInsideScreenElement.querySelector(`.level${r}`);
                            correspondentResult.classList.remove('hiddingClass');
                            resultLevel = correspondentResult;
                            let x = `${percentualScore}% de acerto: ` + resultLevel.querySelector('#resultScreenTitle').innerText;
                            resultLevel.querySelector('#resultScreenTitle').innerText = x;
                            stop = 1;
                        }
                    }
                }
                setTimeout(scrollToResultScreen, 2000);
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
    if (possiblePoints < selectedQuizz.questions.length) {
        setTimeout(scrollToNextQuestion, 2000)
    }
}

function scrollToNextQuestion() {
    let nextPosition = atualQuestion.nextElementSibling.offsetTop - 50;
    let scrollOptions = {
        top: nextPosition,
        behavior: 'smooth'
    }
    window.scrollTo(scrollOptions);
}

function scrollToResultScreen() {
    let resultScreen = resultLevel.offsetTop - 50;
    scrollOptions = {
        top: resultScreen,
        behavior: 'smooth'
    }
    window.scrollTo(scrollOptions);
}

function homeAndCreateScreenTransition(quizzID) {
    homeScreenElement.classList.toggle("hiddingClass");
    createQuizzScreenElement.classList.toggle("hiddingClass");
}

