// QUESTION CONSTRUCTOR
function Question(text, choices, answer) {
	this.text = text; // string
	this.choices = choices; // array
	this.answer = answer; // string
}
Question.prototype.isCorrect = function(choice) {
	// Return TRUE if choice matches correct answer
	console.log("this.answer: "+ this.answer);
	console.log("choice: "+ choice);
	return this.answer === choice; 
};

// QUIZ CONSTRUCTOR
function Quiz(questions) {
	// Array of questions
	this.questions = questions;
	// Track which question you're on, starting with the first question
	this.currentQuestionIndex = 0;
	this.score = 0; // Score keeper
}

Quiz.prototype.getCurrentQuestion = function() {
	return this.questions[this.currentQuestionIndex];
};

Quiz.prototype.checkAnswer = function(answer) {
	if(this.getCurrentQuestion().isCorrect(answer)) {
		this.score++; // Add 1 point if correct
	}
	//console.log("currentQuestionIndex : " + this.currentQuestionIndex);
	this.currentQuestionIndex++; // Get ready for next question
};

// Check if quiz end is reached
Quiz.prototype.hasEnded = function() {
	// Return TRUE only after last question
	return this.currentQuestionIndex >= this.questions.length;
};

// QUIZ UI
var QuizUI = {
	displayNext: function() {
		if(quiz.hasEnded()) {
			this.showResults();
		} else {
			this.displayQuestion();
			this.displayChoices();
			this.displayProgress();
			this.displayScore();
		}
	},
	displayQuestion: function() {
		this.populateIdWithHTML('question', quiz.getCurrentQuestion().text);
	},
	displayChoices: function() {
		var choices = quiz.getCurrentQuestion().choices;
		// Loop through each choice and display on page
		for(var i = 0; i < choices.length; i++) {
			var choiceId =  + i;
			var choiceText = choices[i];
			console.log("choiceText   choiceText choiceText " + choiceText);
			this.populateIdWithText(choiceId, choiceText);
			this.checkAnswerHandler(choiceId, choiceText);
		}
	},
	checkAnswerHandler: function(id, guess) {
		var button = document.getElementById(id);
		button.onclick = function() {
			quiz.checkAnswer(guess);
			QuizUI.displayNext();
		}
	},
	displayScore: function() {
		var scoreText = 'Score: ' + quiz.score;
		this.populateIdWithHTML('score', scoreText);
	},
	displayProgress: function() {
		var questionNumber = quiz.currentQuestionIndex + 1;
		var totalQuestions = quiz.questions.length;
		var progressText = 'Question ' + questionNumber + ' of ' + totalQuestions;
		this.populateIdWithHTML('progress', progressText);
	},
	showResults: function() {
		var grade = quiz.score/quiz.questions.length;
		var results = '<h2>';
		if(grade >= 0.8) {
			results += 'Excellent!';
		} else if(grade < 0.8 && grade > 0.5) {
			results += 'Not Bad...';
		} else {
			results += 'Terrible!';
		}
		results += '</h2><h3>Your final score is: ' + quiz.score + '</h3>';
		results += '<button id="reset">Try Again?</button>';
		this.populateIdWithHTML('quiz', results);
		this.resetQuizHandler();
	},
	resetQuizHandler: function() {
		var resetBtn = document.getElementById('reset');
		// Reload quiz to start from beginning
		resetBtn.onclick = function() {
			window.location.reload(false);
		}
	},
	populateIdWithText: function(id, content) {
		var element = document.getElementById(id);
		element.innerText = content;
	},
	populateIdWithHTML: function(id, content) {
		var element = document.getElementById(id);
		element.innerHTML = content;
	}
};
var questions = [];
var testuse ="";
var quiz= null;
function retrieveQuestion(questionNo){
	var goRequest = new XMLHttpRequest();
    var params = {
      "questionNumber": questionNo,
    }
    
    

    goRequest.open("POST", "https://dry-peak-40603.herokuapp.com/test/quiz");
    goRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  
    goRequest.onload = function () {
      var ourData = JSON.parse(goRequest.responseText);
      console.log(ourData.searchRes);
      testuse = ourData.searchRes;
      
      questions = [
           	new Question(ourData.searchRes.question, [ourData.searchRes.opt1, ourData.searchRes.opt2, ourData.searchRes.opt3,ourData.searchRes.opt4], ourData.searchRes.answer)
           ];
      console.log(questions);
      if (questions.length !=0) {
    	  quiz = new Quiz(questions);
    	  QuizUI.displayNext();

    	  }
    };
    goRequest.send(JSON.stringify(params));
    return 0;
};

// CREATE QUESTIONS
//var questions = [
//	new Question('Which state is Chicago in?', ['Iowa', 'Illinois', 'Indiana','Jakarta'], 'Illinois')
//]//;
// CREATE QUIZ & DISPLAY FIRST QUESTION




var horizontal			= 0;
var btnFocusPointer 	= 0;
document.getElementById("0").style.border = "10px solid green";
function shifting(horizontalShift){
	
	
	newHorizontal	= horizontal + horizontalShift;
	
	
	if (newHorizontal <= 3 && newHorizontal >= 0) {
		horizontal 	= newHorizontal;
	} else {
		horizontal = horizontal;
	}
		
	
	btnFocusPointer = horizontal.toString();
	
	btnHighlight(btnFocusPointer);
  }

function btnHighlight(btnID){
	btnClearHighlight();
  	document.getElementById(btnID.toString()).style.border = "10px solid green";
  }

function btnClearHighlight(){
  	var button = document.getElementsByClassName("fbutton column");

  	for (var i = button.length - 1; i >= 0; i--) {
  		button[i].style.border = "none";
  	}
  }


function inputValue(buttonValue){
	var choices = quiz.getCurrentQuestion().choices;
	/*for(var i = 0; i < choices.length; i++){
		var choiceId =  + i;
		var choiceText = choices[i];
	}
	*/
	
  			console.log("BUTTONVALUE : " + buttonValue);
  			var choices = quiz.getCurrentQuestion().choices;
  			var choiceText = choices[buttonValue];
  			console.log("CHOICE TEXT FROM INPUT VALUE: " +choiceText );
  			quiz.checkAnswer(choiceText);
			QuizUI.displayNext();
				
	
  }


//Remote event listener IDs:
//10009 	= back
//13		= Enter
//37		= Left
//38		= Up
//39		= Right
//40		= Down
//--------------------------------------------
document.addEventListener('keydown', function(remoteEvent) {

	switch(remoteEvent.keyCode) {
	  case 10009:		  	
			tizen.application.getCurrentApplication().exit();
		    break;
	  case 13:
		  btnFocusPointer = horizontal.toString();
		  console.log("BTN:           " + btnFocusPointer);
		  console.log("WITHOUT VALUE:    " + document.getElementById(btnFocusPointer));
		  console.log("WITH VALUE:    " +document.getElementById(btnFocusPointer).value);
		  var pressedValue = document.getElementById(btnFocusPointer).value;
		  console.log("pressedValue : " + pressedValue);
		  inputValue(pressedValue);
		 
		  break;
	  case 37:		  
		  shifting(-1);
		  btnHighlight(btnFocusPointer);		  
		  break;

	  case 39:		  
		  shifting(1);
		  btnHighlight(btnFocusPointer);
		  break;
	
	  default:
		  	document.getElementById('quiz').innerHTML=remoteEvent.keyCode;
	}
});