// Fetch data from the data.json file
const fetchData = () => {
  return fetch('data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json();
    })
    .then(data => data.questions)
    .catch(error => {
      console.log('An error occurred while fetching data:', error);
       return [];
    });
};


// Generate quiz questions and options dynamically
// generate quize
const generateQuiz = (questions) => {
  const quizContainer = document.getElementById('quizContainer');
  let html = '';

  questions.forEach((question, index) => {
      html += `
<div class="card my-4 ${index == 0 ? 'active' : ''}">
  <div class="card-header">
    <h5>Question ${index + 1}:</h5>
  </div>
  <div class="card-body">
    <p>${question.Question}</p>

    <h6 class="mb-2" style="color : #9a0ed9;" > <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-exclamation-circle" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
  </svg>  Select the correct option and submit</h6>

    ${generateOptions(question)}
  </div>
  <div class="card-footer ">
    
    <button class="mdc-button mdc-button--raised submitBtn">
       <span class="mdc-button__label">Submit</span>
     </button>
  </div>
</div>
`;
  });

  quizContainer.innerHTML = html;

  // Add event listeners to submit buttons
  const submitButtons = document.getElementsByClassName('submitBtn');
  Array.from(submitButtons).forEach((button, index) => {
      button.addEventListener('click', () => {
          checkAnswer(index, questions);
      });
  });
};

// Generate options for each question
const generateOptions = (question) => {
  let optionsHtml = '';

  if (question.quesType === 'mcq') {
      question.options.forEach((option, index) => {
          optionsHtml += `
  <div class="form-check">
    <input class="form-check-input" type="radio" name="option_${question.QuestionNo}" id="option_${question.QuestionNo}_${index}" value="${index}">
    <label class="form-check-label" for="option_${question.QuestionNo}_${index}">
      ${option} 
    </label>
  </div>
`; 
      });
  } else if (question.quesType === 'mrq') {
      question.options.forEach((option, index) => {
          optionsHtml += `
  <div class="form-check">
    <input class="form-check-input" type="checkbox" name="option_${question.QuestionNo}" id="option_${question.QuestionNo}_${index}" value="${index}">
    <label class="form-check-label" for="option_${question.QuestionNo}_${index}">
      ${option} 
      
    </label>
  </div>
`;
      });
  }

  return optionsHtml;
};

// Show feedback popup with correct/incorrect message
const showFeedback = (isCorrect, correctAnswer, callback) => {
  const modalTitle = document.querySelector('#feedbackContainer .modal-title');
  const modalBody = document.querySelector('#feedbackContainer .modal-body');
  const nextButton = document.getElementById('nextButton');
  const closeButton = document.getElementById('closeButton');

  closeButton.addEventListener('click', () => {
      $('#feedbackContainer').modal('hide');
    });
    
  modalTitle.textContent = isCorrect ? "That's correct" : 'Not quite!';
  modalBody.innerHTML = isCorrect ? '<p>Well done!</p>' : `<p>Correct Answer: ${correctAnswer}</p>`;
  nextButton.style.display = isLastQuestion() ? 'none' : 'block';

  $('#feedbackContainer').modal('show');

  // Add event listener to the "Next" button if it should be displayed
  if (!isLastQuestion()) {
      nextButton.addEventListener('click', callback);
  }
};

// Check the learner's answer and display feedback
const checkAnswer = (index, questions) => {
  const currentQuestion = document.getElementsByClassName('card')[index];

  const selectedOptions = Array.from(currentQuestion.querySelectorAll(
          `input[name="option_${questions[index].QuestionNo}"]:checked`))
      .map(option => option.value);

  const answer = questions[index].Answer.split(',');
  const isCorrect = arraysEqual(selectedOptions, answer);
  const correctAnswer = questions[index].options.filter((_, index) => answer.includes(index.toString()))
      .join(', ');
    
  showFeedback(isCorrect, correctAnswer, () => {
      nextQuestion(index);
  }
  );
};

// Check if the current question is the last question
const isLastQuestion = () => {
  const activeQuestion = document.querySelector('.card.active');
  return activeQuestion.nextElementSibling === null;
};

// Display the next question
const nextQuestion = (currentIndex) => {
  const currentQuestion = document.getElementsByClassName('card')[currentIndex];
  const nextQuestion = currentQuestion.nextElementSibling;

  currentQuestion.classList.remove('active');
  nextQuestion.classList.add('active');
};

// Helper function to compare two arrays for equality
const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, index) => val === arr2[index]);
};

// Fetch data and initialize the quiz
fetchData()
  .then(questions => {
      generateQuiz(questions);
  });