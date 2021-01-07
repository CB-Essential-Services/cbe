// Adapted from:
// https://github.com/sw-yx/gatsby-netlify-form-example-v2/blob/master/src/pages/contact.js
// https://www.netlify.com/blog/2017/07/20/how-to-integrate-netlifys-form-handling-in-a-react-app/

// This is what we'll use to navigate to the custom success page
// More on this here: https://www.gatsbyjs.org/docs/gatsby-link/#how-to-use-the-navigate-helper-function
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

let stripePromise
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe("pk_live_bguEpM8vKoFeXb4KPvoJWr4o00vBuhmOwF")
  }
  return stripePromise
};

  const redirectToCheckout = async event => {

    const stripe = await getStripe()
    const { error } = await stripe.redirectToCheckout({
      mode: "subscription",
      lineItems: [{ price: "price_1HhgfkAeKYVunD5vT563QMgx", quantity: 1 }],
      successUrl: `https://cbe-fc368.netlify.app/thanks/`,
      cancelUrl: `https://cbe-fc368.netlify.app/404/`,
    });

    if (error) {
      console.warn("Error:", error)
    }
  };
// This function encodes the captured form data in the format that Netlify's backend requires
function encode(data) {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&");
  }

const Checkout = (props) => {
  const [name, setName] = useState("")

  const handleChange = (e) => {
    setName({ ...name, [e.target.name]: e.target.value })
  }

  const handleSubmit = (event) => {
    // Prevent the default onSubmit behavior
    event.preventDefault();
    // POST the encoded form with the content-type header that's required for a text submission
    // Note that the header will be different for POSTing a file
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({ 
        "form-name": event.target.getAttribute("name"), 
        ...name
      })
    })
      // On success, redirect to the custom success page using Gatsby's `navigate` helper function
      .then(() => redirectToCheckout())
             // On error, show the error in an alert
      .catch(error => alert(error));
  };

  return (
    <form data-netlify="true"  data-netlify-honeypot="bot-field" action="/" name="transfer" method="post" onSubmit={(e) => { console.log(e); handleSubmit(e);}}>
      <input type="hidden" name="form-name" value="transfer" />

      <p className="screen-reader-text">
        <label>Don't fill this out if you're human: 
          <input name="bot-field" />
          </label>
          </p>

          <p className="form-row">
      <label>
        Phone:
        <input
          name="phone"
          type="tel" required
          onChange={handleChange}
        />
      </label>     
       </p> 

          <p className="form-row">
      <label>
      LEI Code:
        <input
          name="leiCode"
          type="text" required
          onChange={handleChange}
        />
      </label>     
       </p> 

       <p> Unsure what your LEI is? Use our <a href="/lei-search" target="_blank" rel="noopener noreferrer">discovery tool </a> </p>

      <p className="form-row form-submit">
      <button type="submit" >Pay</button>   
      </p> 

      </form>
  );
}

export default Checkout