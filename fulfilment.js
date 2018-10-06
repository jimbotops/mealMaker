'use strict';

// Import the Dialogflow module from the Actions on Google client library.
const {dialogflow} = require('actions-on-google');
const {
  NewSurface,
  Button,
  BasicCard,
  SimpleResponse,
  Image
 } = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');
const {Card} = require('dialogflow-fulfillment');

var requestLib = require('request');
var randnum = require('random-number-between');

// Generate a random number for the recipes array
var rand1 = randnum(0, 9, 1);

// Generate another random number that's not the same as rand1
var rand2;
if (rand1 == 9) { rand2 = 0; } 
else { rand2 = rand1++; }

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});
var ingredients;

app.intent('Main', (conv, {protein, carb}) => {
    ingredients = `${protein},${carb}`;
    const capability = 'actions.capability.SCREEN_OUTPUT'
    if (conv.surface.capabilities.has(capability)) {
        return callRecipeApi(ingredients).then((output) => {
            var recipes = JSON.parse(output);
            conv.ask(
            new SimpleResponse({
                text: 'A couple of recipes you might like are ' + recipes.results[rand1].title + ' or ' + recipes.results[rand2].title,
                speech:  'Have a look at the recipe card below'
            }),
            new BasicCard({
                text: recipes.results[rand1].title,
                title: 'MealMaker recipes',
                buttons: new Button({
                    title: recipes.results[rand1].title,
                    url: recipes.results[rand1].href,
                }),
                image: new Image({
                        url: 'recipes.results[rand1].thumbnail',
                }),
            })
          );
        })
    } else {
        conv.ask(new NewSurface({
            capabilities: capability,
            context: 'Here is the recipe card',
            notification: 'Here is the recipe card',
        }))
    }
})

// Create a Dialogflow intent with the `actions_intent_NEW_SURFACE` event
app.intent('New Surface', (conv, input, newSurface) => {
    console.log('New intent -JT');
    if (newSurface.status === 'OK') {
        return callRecipeApi(ingredients).then((output) => {
            var recipes = JSON.parse(output);
            conv.ask(
            new SimpleResponse({
                text: 'A couple of recipes you might like are ' + recipes.results[rand1].title + ' or ' + recipes.results[rand2].title,
                speech:  'Have a look at the recipe card below'
                }),
            new BasicCard({
                text: recipes.results[rand1].title,
                title: 'MealMaker recipes',
                buttons: new Button({
                    title: recipes.results[rand1].title,
                    url: recipes.results[rand1].href,
                }),
                image: new Image({
                    url: recipes.results[rand1].thumbnail,
                    accessibility_text: 'here is a picture'
                }),
            })
        );
        })
    } else {
        conv.close(`Ok, I understand. You don't want to see the recipes. Bye`)
    }
})

// Big thanks to http://www.recipepuppy.com/about/api/ for the open API used to find the recipes
function callRecipeApi(ingredients) {
    return new Promise((resolve, reject) => {
        // Make call to recipe API with formatted ingridients variable
        var url = `http://www.recipepuppy.com/api/?i=${ingredients}`;
        requestLib(url, function (error, response, body) {
            var recipes = JSON.parse(body);
            resolve(body);
        });
    });
}

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);