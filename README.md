# Assignment 2: JavaScript

In this second assignment, you are tasked with adding interactivity to the __Artmart__ website using JavaScript. In particular, you need to implement the following features:

- On the __Search__ page, the user should be able to search for artworks.
  - The query parameter `q` should contain the search term.
  - Use the [Metropolitan Museum of Art Collection API][met_api], in particular the *Search* and *Object* endpoints.
  - Consider only artworks that actually have images.
  - Return only the first 100 results per search.
  - For each search result, link the artwork image to the corresponding frame configurator page.
  - During a search, replace the "Search our collection of more than 400,000 artworks" text with `Searching for “<term>”...` where `<term>` is the search term. When the search is done, the text should say `Found <number> artworks for “<term>”` where `<number>` is the number of results. Take care to properly pluralize "artworks" depending on the number of results.
  - If no search term was given, display a selection of highlights from the collection. The object IDs for the highlighted artworks are given in `highlights.json`.
  - Cache responses from the Met API's *Object* endpoint using local storage.

- The __Frame Configurator__ should enable the user to configure the frame for a selected artwork.
  - Use a query parameter `objectID` to determine which artwork is being configured on the page. If the requested picture does not exist, the user should be redirected to the Search page.
  - Use the query parameters `printSize`, `frameStyle`, `frameWidth`, `matColor` and `matWidth` to optionally pre-set the frame configuration parameters, so that other pages can link to a specific configuration. The width values should be given in millimeters.
  - Connect the frame width and mat width text fields with their respective range sliders, so that changing the value of the slider changes the value in the text field, and vice versa.
  - Ensure that only valid values can be entered for frame and mat width. The frame width can range from 2&ndash;5&nbsp;cm and the mat width from 0&ndash;10&nbsp;cm, both with 10&nbsp;mm steps.
  - Use the helper functions in `frame.js` to dynamically update the preview image whenever the print size, frame width, frame style, mat width or mat color change.
  - Use the helper functions in `frame.js` to display the right print sizes in cm for small, medium and large prints and to calculate to the total print size whenever the configuration changes.
  - Implement a function in `frame.js` to calculate the price of a particular frame configuration. For small prints, each frame has a base cost of 30€, plus the wood cost per centimeter of width: 1€ per centimeter for a classic frame, 80¢ for a natural frame, 90¢ for a shabby frame and 85¢ for an elegant frame. One centimeter of mat costs 5¢. Medium prints are twice the price of small prints and large prints are three-and-a-half times the price.
  - When the "Add to Cart" button is pressed, add the selected artwork with its configuration to the shopping cart and redirect the user to the shopping cart page.

- The __Shopping Cart__ page should allow the user to manage their shopping cart.
  - Use the local storage key `cart` to store the shopping cart, which should be represented as a JSON array of objects containing an `objectID` and the frame configuration parameters, but nothing more. In particular, the shopping cart should not contain artwork metadata or the calculated price of each item.
  - For each item in the cart, display a preview of the artwork in its configured frame. Use the helper functions in `frame.js`. The preview image should link to the corresponding frame configurator page.
  - For each item in the cart, display the usual artwork information (title, artist, date) and a textual description of the configuration. The description should be like "Medium print in a 3.3&nbsp;cm natural frame with a 1.7&nbsp;cm mint mat." or "Small print in a 5&nbsp;cm classic frame." (if the mat has width 0).
  - Show the price of each item, as well as the sum total.
  - Allow the user to remove items from the cart by clicking on the circled "x".
  - Display the most recently added item on top.
  - If there are no items in the cart, show the message "There are no items in your shopping cart." and disable the checkout button.  
  - On each page, next to the "Cart" link in the navigation, show the number of items in the cart (in parentheses). If there are no items in the cart, don't show any parentheses.

- The __Checkout__ page should allow the user to finalize their order.
  - If there are no items in the shopping cart, the user should be redirected to the empty shopping cart page.
  - Show the subtotal for all items in the shopping cart.
  - Calculate the total price including shipping costs for the selected country.
  - Get the available countries and associated shipping costs using the [Artmart Shipping API][shipping_api]. While the data is loading, or in case there was an error, the shipping costs and total price should be replaced by an em-dash (i.e. `€ —`) and the pay button should be disabled.
  - The pay button doesn't have to do anything.
  
## What you need to do

- Check out the `www` folder. It contains a complete sample solution for A1, so you don't have to re-implement all of the HTML and CSS for the static part of the website. It also contains JavaScript fragments to use as starting points for A2. Take a look at what's there and figure out what remains to be done.

- Re-read the requirements above.

- Read the documentation for the [Metropolitan Museum of Art Collection API][met_api].

- Read the documentation for the [Artmart Shipping API][shipping_api].

- Take a look at the `test` folder. You will again find a test script with which you can measure progress. If something is not covered by the tests, *but specified in the assignment*, then we expect you to implement it. We might run additional tests on our end. Inversely, if something is not specified in the assignment, *but expected by the tests*, then we also expect you to implement it.

- This assignment is about JavaScript. You can use all the latest and greatest features of the current ECMAScript version (provided they are actually implemented in the current range of browsers). However, you are not allowed to use any third party libraries or frameworks. You *are* allowed to use TypeScript, but you need to commit all the compiled JavaScript files and ensure that the tests work.

- You are not required to take backwards-compatibility into account. You can code against the latest versions of Chrome, Firefox and Safari. You *will* need to ensure cross-browser and cross-platform compatibility, but within reason.

- As this is a group exercise, we expect all team members to contribute in roughly equal amounts. Note in particular that some of the pages take significantly more effort than others, so **don't just split the assignment up by page**. The git history reflects each team member's individual contributions, so keep that in mind.

[met_api]: https://metmuseum.github.io
[shipping_api]: https://web-engineering.big.tuwien.ac.at/s20/a2
