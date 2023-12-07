const jobForm = document.querySelector('.job-form');
const filterJobsForm = document.querySelector('.filter-jobs-form')
const quill = document.getElementById('editor')
const paypalButtonContainer= document.getElementById('paypal-button-container')
const pricingBtn = document.getElementById('pricingBtn')
const newsletterForm = document.getElementById('newsletter')
const applyBtn = document.getElementById('applyBtn')
const jobShownInfo = document.querySelector('.jobShownInfo')


// QUILL LOGIC
if(quill) {

  // Function to convert Delta object to HTML
  function deltaToHtml(delta) {
    var tempCont = document.createElement('div');
    (new Quill(tempCont)).setContents(delta);
    return tempCont.getElementsByClassName('ql-editor')[0].innerHTML;
    }

  // Function to handle form submission
  function assignEditorContentBeforeSubmit() {
    
    // Get the Quill editor's content as a Delta object
    var delta = editor.getContents();

    // Convert Delta object to HTML
    var editorContent = deltaToHtml(delta);

    // Set the editor content to the hidden input
    document.getElementById('editorContent').value = editorContent;

  }

    // Add an event listener to the "POST JOB NOW" button
    document.getElementById('postJobBtn').addEventListener('click', assignEditorContentBeforeSubmit);
}

if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();

    // Create a new FormData object and pass the job form to it
    const formData = new FormData(newsletterForm);

    // Convert the FormData object to a plain object
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });

    console.log(formObject)


    fetch('/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(formObject)
    })
    .then(response => {
      if(!response.ok){
        alert('Subscription failed')
      }else {
        alert('Subscription Success')
      }
    })
    .catch(err => alert('something went wrong'))

  })

}


// SUMBIT LOGIC
if (jobForm) {
  jobForm.addEventListener('submit', e => {
    e.preventDefault(); // Prevent the default form submission

    // Create a new FormData object and pass the job form to it
    const formData = new FormData(jobForm);

    // Convert the FormData object to a plain object
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });


    fetch('/api/v1/jobs/validateJob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formObject)
    })

    .then(response => {
      if(!response.ok){
        return response.json().then(errorData => {
          throw new Error(errorData.message)
        })
      }
      // When we say "parse data as JSON," it means converting a JSON-formatted string into a JavaScript object.
      // response.json() is a method used to parse the JSON data from the response body of a fetch 
      // request and returns a Promise that resolves with the corresponding JavaScript object representation of the JSON data.
      return response.json()
    }).then(data => {
      const validatedJobData = data.data.postedJobData;
      localStorage.setItem('validatedJobData', JSON.stringify(validatedJobData))
      window.location.href = '/pricing'
    })

    .catch(error => {
      // both the server and the website are at the same server, so don't worry that when fetching non existing
      // website or down website that the fetch error will be exposed as if this 127... doesn't exist you won't 
      // be able to open the form itself to send the request
      alert(error.message)
    })
    // Clear the form fields after submission (optional)
    // jobForm.reset();
  });
}

if(filterJobsForm){
  const searchParams = new URLSearchParams(window.location.search);
  for (const [key, value] of searchParams.entries()) {
    if(value != ''){
      document.getElementsByName(key)[0].value = value
      // console.log(`key: ${key}, value: ${value}`)
    }
  }

}


if(pricingBtn) {

  const validatedJobData = JSON.parse(localStorage.getItem('validatedJobData'));

  const dataToSend = {
    validatedJobData
  }


  pricingBtn.addEventListener('click', ()=> {

    fetch('/api/v1/jobs/createFreeJob', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, 
      body: JSON.stringify(dataToSend)
    })
    .then(response => {
      if (!response.ok){
        alert('Oops! Something went wrong. Please try again. 😞')
      } else {
        alert('Success! Your job will be published soon. 🚀')
        window.location.href = '/'
      }
    })
    .catch(
      err => alert('something went wrongxxxx')
    )


  })
}

// PAYPAL LOGIC
if (paypalButtonContainer) {

  paypal.Buttons({
  // Order is created on the server and the order id is returned
  createOrder() {
    return fetch("/create-paypal-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // use the "body" param to optionally pass additional order information
      // like product skus and quantities
      body: JSON.stringify({
        cart: [
          {
            sku: "YOUR_PRODUCT_STOCK_KEEPING_UNIT",
            quantity: "YOUR_PRODUCT_QUANTITY",
          },
        ],
      }),
    })
    .then((response) => response.json())
    .then((order) => order.id);
  },
  // Finalize the transaction on the server after payer approval
  onApprove(data) {
    return fetch("/capture-paypal-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: data.orderID
      })
    })
    .then((response) => response.json())
    .then((orderData) => {
      // Successful capture! For dev/demo purposes:
      console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
      const transaction = orderData.purchase_units[0].payments.captures[0];
      console.log(`Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`);

      const validatedJobData = JSON.parse(localStorage.getItem('validatedJobData'));

      const dataToSend = {
        validatedJobData,
        transactionId: orderData.id
      }

      fetch(`/api/v1/jobs`, {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend)
      })
      .then(response => {
        if (!response.ok){
          return response.json().then( errorData => {throw new Error (errorData.message)})
        }else{
          alert('Job was posted successfully')
          window.location.href = '/'
        }
      })
      
      .catch(error => {
        // both the server and the website are at the same server, so don't worry that when fetching non existing
        // website or down website that the fetch error will be exposed as if this 127... doesn't exist you won't 
        // be able to open the form itself to send the request
        alert(error.message)
      })
    }).catch(error => {
      alert('Something went wrong- Payment Not Completed')
    })
  }
}).render('#paypal-button-container');}



document.addEventListener("DOMContentLoaded", function () {
  // Get the current URL
  const currentURL = window.location.href;

  // Check if the current URL includes '/jobs'
  if (currentURL.includes('/jobs')) {
      // If '/jobs' is found in the URL, hide the element
      jobShownInfo.style.display = "none";
  }
});