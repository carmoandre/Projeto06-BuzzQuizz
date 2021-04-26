history.scrollRestoration = "manual";

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

const lists = document.querySelectorAll(".quizzes");
const myQuizzesEmpty = document.querySelector(".emptyList");
const myQuizzesFull = document.querySelector(".quizzesList");
const homeScreenElement = document.querySelector(".homeScreen");
const quizzInsideScreenElement = document.querySelector(".quizzInsideScreen");
const createQuizzScreenElement = document.querySelector(".createQuizzScreen");
let atualQuizzId;
let atualQuestion;
let selectedQuizz;
let quizzLevelsMinValues = [];
let quizzLevelsIds = [];
let possiblePoints = 0;
let score = 0;
let resultLevel;
let newQuizz = {}
let numberOfQuestions = 0;
let numberOfLevels = 0;
let newQuestions = [];
let inputsToClean;
let newLevels = [];
let newestQuizzes;
let questionFieldsValidation = false;

let myQuizzesList = [];
updateMyQuizzesList();

if (myQuizzesList.length > 0) {
    myQuizzesEmpty.classList.toggle("hiddingClass");
    myQuizzesFull.classList.toggle("hiddingClass");
}

getAllQuizzes()

function getAllQuizzes() {
    const request = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes");

    request.then(renderWithAnswer);
    request.catch(gettingAllQuizzesError);
}

function renderWithAnswer(answer) {
    renderQuizzes(answer.data);
}

function gettingAllQuizzesError(answer) {
    alert(`Erro ao tentar recuperar os Quizess! Status: ${answer.response.status}. Por favor, recarregue a página e tente de novo`);
}

function renderQuizzes(quizzesList) {
    newestQuizzes = quizzesList;
    resetQuizzesLists();
    let keys = Object.keys(localStorage);
    for (let i=0; i<localStorage.length; i++) {
        updateLocalStorage(localStorage.getItem(keys[i]));
    }
    quizzesList.forEach(renderQuizz);
}

function resetQuizzesLists() {
    lists[0].innerHTML = "";
    lists[1].innerHTML = "";
}

function renderQuizz(quizzInfo) {
    if (myQuizzesList.length > 0) {
        let test = true;
        //CASO SEJA UM DOS QUIZZES DO USUÁRIO:
        for (let i = 0; i < myQuizzesList.length; i++) {
            if (quizzInfo.id == myQuizzesList[i]) {
                lists[0].innerHTML += `
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
        }
        //CASO NÃO SEJA UM DOS QUIZZES DO USUÁRIO:
        for (let i = 0; i < myQuizzesList.length; i++) {
            if (quizzInfo.id == myQuizzesList[i]) {
                test = false;
            }
        }
        if (test == true) {
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

    } else {
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
}

function toQuizzInsideScreenTransition(quizzID) {
    atualQuizzId = quizzID;
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
    for (let i = 0; i < selectedQuizz.questions.length; i++) {
        finalHTML += `
        <ul onclick="scrollPage(this)" class='quizzQuestion' id='question${i}'>
            <li style='background-color: ${selectedQuizz.questions[i].color}'>
                <p>${selectedQuizz.questions[i].title}</p>
            </li>
            `;
        let answers = selectedQuizz.questions[i].answers;
        shuffleAnswers(answers);
        for (let j = 0; j < answers.length; j++) {
            finalHTML += `
            <li value=${answers[j].isCorrectAnswer} id='possibleAnswer' name='answer${j}'>
                <img src='${answers[j].image}' width="330px" height="175px">
                <h1>${answers[j].text}</h1>
            </li>
            `;
        }
        finalHTML += `</ul>`
    }
    for (let q = 0; q < selectedQuizz.levels.length; q++) {
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
    finalHTML += `
    <button class="restartQuizz" onclick="restartAtualQuizz()">
        Reiniciar quizz
    </button>
    <a onclick="returnToHome()" class="returnToHome">
        Voltar para a home
    </a>
    `;
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
    for (let i = 0; i < possibleAnswers.length; i++) {
        possibleAnswers[i].onclick = function () {
            possiblePoints += 1;
            let answeredQuestion = this.parentElement.querySelectorAll('#possibleAnswer');
            let verifier = this;
            if (verifier.attributes.getNamedItem("value").value == 'true') {
                score += 1;
            }
            for (let k = 0; k < answeredQuestion.length; k++) {
                let greenOrRed = answeredQuestion[k].attributes.getNamedItem("value").value;
                if (greenOrRed == 'true') {
                    answeredQuestion[k].style.color = 'green';
                } else {
                    answeredQuestion[k].style.color = 'red';
                }
                if (answeredQuestion[k] == verifier) { }
                else if (answeredQuestion[k].name != `answer${possibleAnswers[i].name}`) {
                    answeredQuestion[k].classList.add('whiteShade');
                    answeredQuestion[k].onclick = null;
                }
            }
            if (possiblePoints == selectedQuizz.questions.length) {
                let percentualScore = ((score / possiblePoints) * 100);
                percentualScore = Math.floor(percentualScore);
                let stop = 0;
                for (let r = quizzLevelsMinValues.length - 1; r >= 0; r--) {
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

function restartAtualQuizz() {
    quizzLevelsMinValues = [];
    quizzLevelsIds = [];
    possiblePoints = 0;
    score = 0;
    getOneQuizz(atualQuizzId);
    window.scrollTo(0, 0);
}

function returnToHome() {
    document.location.reload();
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

    if (!validateFirstStepsFieldsValues(element)) {
        alert("Algum dos campos não foi preenchido corretamente. Por favor, tente novamente.")
        return;
    }

    newQuizz.title = document.getElementsByName("quizzTitle")[0].value;
    newQuizz.image = document.getElementsByName("quizzImageURL")[0].value;
    numberOfQuestions = document.getElementsByName("numberOfQuestions")[0].value;
    numberOflevels = document.getElementsByName("numberOfLevels")[0].value;
    renderQuestions();
    renderLevels();
    // Duas linhas abaixo: limpeza dos campos de input
    inputsToClean = createQuizzScreenElement.getElementsByTagName("input");
    cleanFields(inputsToClean)
    document.querySelector(".firstSteps").classList.toggle("hiddingClass");
    document.querySelector(".createQuestions").classList.toggle("hiddingClass");

}

function validateFirstStepsFieldsValues(element) {
    let title = document.getElementsByName("quizzTitle")[0].value;
    let image = document.getElementsByName("quizzImageURL")[0].value;
    let questionsNum = document.getElementsByName("numberOfQuestions")[0].value;
    let levelsNum = document.getElementsByName("numberOfLevels")[0].value;
    
    if (title.length < 20 || title.length > 65) {
        return false;
    }

    if(!validURL(image)) {
        return false;
    }
    
    if (questionsNum < 3) {
        return false;
    }

    if (levelsNum < 2) {
        return false;
    }

    return true;
}

function validURL(str) {
    let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

function renderQuestions() {
    const element = document.querySelector(".createQuestions");
    element.innerHTML = "<h1>Criar suas perguntas</h1>";
    for (let i = 0; i < numberOfQuestions; i++) {
        element.innerHTML += `
            <div id="${i + 1}" class="createdQuestion">
                <div class="createdQuestionTitle" onclick="expandCollapseEffect(this)">
                    <p>Pergunta ${i + 1}</p>
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
        if (i === 0) {
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
            <div id="${i + 1}" class="createdLevel">
                <div class="createdLevelTitle" onclick="expandCollapseEffect(this)">
                    <p>Nível ${i + 1}</p>
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
        if (i === 0) {
            expandCollapseEffect(element.children[1].children[0]);
        }
    }
    element.innerHTML += `<button onclick="fromCreateLevelsTosuccessfulCreated(this)">Finalizar Quizz</button>`;
}

function fromCreateQuestionsToCreateLevel(element) {
    //validações de inputs
    const allQuestions = document.querySelectorAll(".createdQuestion");
    allQuestions.forEach(getQuestion);
    if (questionFieldsValidation) {
        alert("O Título deve ter pelo menos 20 caracteres. A cor dever ser em hexadecimal. As perguntas devem ter pelo menos uma resposta correta e uma resposta incorreta. Por favor, preencha novamente");
        questionFieldsValidation = false;
        return;
    }
    document.querySelector(".createQuestions").classList.toggle("hiddingClass");
    document.querySelector(".createLevels").classList.toggle("hiddingClass");
}

function getQuestion(element) {
    let object = {};
    object.title = element.querySelector(".questionText").value;
    object.color = element.querySelector(".questionBGcolor").value;
    if (validateTitleAndColor(object.title, object.color)) {
        questionFieldsValidation = true;
        return;
    }
    object.answers = getAnswers(element);
    if (questionFieldsValidation) {
        newQuestions = [];
        return;
    }
    newQuestions.push(object);
}

function validateTitleAndColor(title, color) {
    if (title.length < 20) {
        return true;   
    }

    if (color.length !== 7 || !validHexadecimal(color)) {
        return true;
    }

    return false;
}

function validHexadecimal(str) {
    let validation = /^#[0-9A-F]{6}$/i.test(str);
    return validation;
}

function getAnswers(element) {
    const answersArray = [];
    const allAnswers = element.querySelectorAll(".inputPair");
    for (let i = 1; i < allAnswers.length; i++) {
        const object = {}
        object.text = allAnswers[i].children[0].value;
        object.image = allAnswers[i].children[1].value;
        
        if ( i < 3 && (object.text === "" || !(validURL(object.image)))) {
            questionFieldsValidation = true;
            return;
        }

        if (i > 2 && (object.text === "" || object.image === "")) {
            continue;
        }

        if (i > 2 && !(validURL(object.image))) {
            questionFieldsValidation = true;
            return;
        }

        if (i === 1) {
            object.isCorrectAnswer = true;
        } else {
            object.isCorrectAnswer = false;
        }
        answersArray.push(object);
    }
    return answersArray;
}



function fromCreateLevelsTosuccessfulCreated(element) {
    if (validateCreateLevelsFieldsValues(element) == false) {
        alert("Algum dos campos não foi preenchido corretamente. Por favor, tente novamente.");
        return;
    }
    //validações dos inputs
    const levels = document.querySelectorAll(".createdLevel");
    levels.forEach(getLevels);

    buildNewQuizz();
    postNewQuizz();
}

function getLevels(element) {
    const levelInfo = element.querySelectorAll(".inputGroup");
    const object = {
        title: levelInfo[0].children[0].value,
        image: levelInfo[0].children[2].value,
        text: levelInfo[0].children[3].value,
        minValue: levelInfo[0].children[1].value
    }
    newLevels.push(object);
}

function buildNewQuizz() {
    newQuizz.questions = newQuestions;
    newQuizz.levels = newLevels;
}

function postNewQuizz() {
    const request = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/buzzquizz/quizzes", newQuizz);

    request.then(showFinalScreen);
    request.catch(postingNewQuizzError);
}

function showFinalScreen(answer) {
    saveNewQuizzOnLocalStorage(answer.data.id);
    newQuizz = {};
    const recentlyCreated = document.querySelector(".createdQuizzCard");
    recentlyCreated.style.backgroundImage = `
    linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(0, 0, 0, 0.5) 64.58%,
        #000000 100%
      ),
      url(${answer.data.image})
    `;
    recentlyCreated.children[0].innerText = answer.data.title;
    recentlyCreated.id = answer.data.id;
    recentlyCreated.nextElementSibling.id = answer.data.id;
    document.querySelector(".createLevels").classList.toggle("hiddingClass");
    document.querySelector(".successfulCreated").classList.toggle("hiddingClass");

}

function postingNewQuizzError(answer) {
    alert(`Erro ao criar o Quizz! Status: ${answer.response.status}. Por favor, recarregue a página e tente de novo`);
}

function fromSuccessfulCreatedToHomeScreen() {
    document.querySelector(".successfulCreated").classList.toggle("hiddingClass");
    document.querySelector(".firstSteps").classList.toggle("hiddingClass");
    getAllQuizzes();
    homeAndCreateScreenTransition();
}

function fromSuccessfulCreatedToQuizzInsideScreen(element) {
    getOneQuizz(element.id);
    document.querySelector(".successfulCreated").classList.toggle("hiddingClass");
    document.querySelector(".firstSteps").classList.toggle("hiddingClass");
    quizzInsideScreenElement.classList.toggle("hiddingClass");
}

function cleanFields(fields) {
    for (let i = 0; i < fields.length; i++) {
        fields[i].value = "";
    }
}

// ESBOÇO DO USO DO LOCAL STORAGE:
// COMANDOS: localStorage.setItem("chave", item) || localStorage.getItem("chave") || JSON.stringify(array ou objeto) || JSON.parse(array ou objeto serializado)

function saveNewQuizzOnLocalStorage(newQuizzId) {
    localStorage.setItem(`${newQuizzId}`, newQuizzId);
    updateMyQuizzesList();
}

function updateLocalStorage(storagedItem) {
    let outdated = true;
    for (let i=0; i<newestQuizzes.length; i++) {
        if (storagedItem == newestQuizzes[i].id) {
            outdated = false;
        } 
    }
    if (outdated == true) {
        localStorage.removeItem(storagedItem);
    }
}

function updateMyQuizzesList() {
    myQuizzesList = [];
    let keys = Object.keys(localStorage);
    for (let i = 0; i < keys.length; i++) {
        let item = localStorage.getItem(keys[i]);
        myQuizzesList.push(item);
    }
}

function validateCreateLevelsFieldsValues(element) {
    let levelTitle = document.getElementsByName("levelTitle")[0].value;
    let levelMinimumPercentage = document.getElementsByName("levelMinimumPercentage")[0].value;
    let image = document.getElementsByName("quizzImageURL")[0].value;
    let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
    ;
    let levelDescription = document.getElementsByName("levelDescription")[0].value;

    let levelMinimumPercentageValidation = true;

    if (levelTitle.length < 10) {
        return false;
    }

    for (let i=0; i<levelMinimumPercentage.length; i++) {
        let isCorrect = true;
        let haveZero = false;
        let forEnd = (levelMinimumPercentage.length - 1);

        if (levelMinimumPercentage[i] < 0 || levelMinimumPercentage[i] > 100) {
            isCorrect = false;
            return isCorrect;
        }

        if (levelMinimumPercentage[i] == 0) {
            haveZero = true;
        }

        if (haveZero == false) {
            isCorrect = false;
        }

        if (i == forEnd) {
            levelMinimumPercentageValidation = isCorrect;
        }
    }

    if (levelMinimumPercentageValidation == false) {
        return false;
    }

    if (levelDescription.length < 30) {
        return false;
    }


    return !!pattern.test(image);
}