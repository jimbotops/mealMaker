# Meal Maker

This is the code produced from the Google Assitant Medium post I wrote. The essence of which is below (but with worse formatting!)

## Intro
We're going to make an Action that finds a recipe based on the protein and carb you provide to it. If this is done on a device that doesn't have a screen (such as a Google Home), the action will 'switch surfaces' and be sent to a phone instead.
Below is a guide to setting it all up.

## Setup
Here begins the first confusion of Google development. There are multiple tools that are used and all link to each other in subtle ways. To get started, go to https://console.actions.google.com and create a new project. 
Select the food and drink option tile and you'll be presented with the view below
Next, we set the invocation name. This is important as it's the name users will call out to talk to your skill. For this demo, call it Meal Maker.
Setup the name which will trigger your actionNow we're ready to start actually building, we can create a new action. Google gives you a few samples but we want to create a custom intent. An intent is a goal that the user wants to achieve. For this tutorial we're going to have just 2. One, Main, will do all the data collection for us, and two, New Surface, handles the transition from a voice-only assistant to a phone with a screen to display the info.
Select Actions, then create a new custom intentNow all the boilerplate setup is done, we can start doing the fun stuffUpdate intentsFirst, change the title of the intent to Main. This will be needed later when we get to the fulfillments. 
Next, update the training phrases. For this case, these training phrases are redundant but I still like to include them for future expansions. Usually the flow would be:
Welcome Intent -> Custom Intent 1 -> Custom Intent 2 …
However, as we only have 1 (functional) intent, I chose to ignore the welcoming of the user and just let them get straight to it.
Create Protein entityCreate Carb entityNext we create the Entities. Entities are simply a collection of things, in this case nouns, relating to food. We will setup 2, one that collects which protein the user wants to eat and one that specifies which carb.
I've put some examples above but here is where you can really start experimenting. If these don't work for you, add some, delete some, you have total freedom. I've also ticked the 'Allow automated expansion' box which should, in theory, identify the types of entities you've listed and automagically add similar things to that entity. I've had little success with this. For example I manually added: pasta, penne, noodles, tagliatelle but even with automated expansion Google didn't recognise spaghetti.
Now switching back to the Intent, we can add our required parameters, one for protein and one for carbs. These make sure the intent gathers this information from the user before passing the JSON package of collected data over to the fulfillment. It does this by comparing what the user has said to that of the entities we created above. If they match, great! If they don't it will prompt (then re-prompt) the user to supply this info. To do this:
Tick the 'Required' box
Give the parameter names as 'protein' and 'carb'
Assign them to the respective entities we made in the step above
Create suitable prompts to tell the user what's required from them


Save this then give it a try using the demo console on the right. The conversation should go something like this:
"What should I eat"
…
And the demo panel should identify these entities and list them. Great, this is pretty much all the conversation we'll have with the user. There's just one more thing to do as setup for fulfillments…

## Surfaces
Surfaces are the Google way of saying device type, i.e. does this device have a screen/audio/web browser etc. This is important to us as if the user triggers this action through a Google Home, we want to send the recipes to their phone rather than just shouting them all out.
To do this, we need to create a new intent called New Surface, with event actions_intent_NEW_SURFACE. Scroll to the bottom and ensure Enable webhook call for this intent is checked in the Fulfillment section, and that's it. Nothing else needs to go in this intent

Next we're going to do something useful with this data by using Fulfillments, but first let's introduce Googles next tool, Firebase.

## Firebase
Firebase is the workhorse behind the fulfillments, but it does come with some restrictions that we'll need to overcome for this demo to work properly. Firebase has different subscription models. By default you'll be on the super light free tier, but we need to upgrade this to the pay-as-you-go option (Blaze) to allow us to make calls out to an external API. Although this is an inconvenience we should stay within the free tier.
Go to Firebase https://console.firebase.google.com to do this
Once you've done this, jump back over to the fulfilments page and let's get coding!

## Fulfillments
As I learnt the hard way, there are many ways that you can code fulfillments. Locally, hosted outside of Google's infra or (as we shall do it) using the inline editor. Even within this editor, there are a mishmash of valid techniques to achieve the same end result. My advice is delete all the standard code they provide, and we'll add back what we need below. All of this is available on the github repo.
First off, we import all the necessary packages into the codebase. Again, I found the Google docs on this lacking and used trial and error for most of this. Make sure to include these in the package.json 

Create 2 random numbers (that are different) that we can use to pick the recipes
3. Now a lot if happening here, but I'll point out the important bits:
Line 31 - Instantiate DialogFlow 
Line 34 - Map the intent 'Main' that we created in DialogFlow to this call
Line 39 - Check the 'Surface' (which is the Google way of saying device type). Because we're displaying recipes we want to display them on a screen, so if you started this conversation on a Google Home, it will ask to transfer you by jumping down to Line 65
Line 41 - Make the call to the recipe API
Line 43 - conv.ask is the way of returning data back to the user. We do that in 2 ways here, Line 45 is just a simple text response, Line 50 is a 'rich media' card that lets us add pictures/buttons etc. More info on the supported response types is here: https://developers.google.com/actions/assistant/responses 

4. Google will then ask the user if they want to move to another surface, if yes, the 'New Surface' intent we created earlier will be triggered by the event and Line 76 will execute the same API and response code as above. If not, the conversation is closed with a message as in Line 98
5. Here's the actual bit of code that goes off and fetches the recipes
6. Finally (and very importantly) setup DialogflowApp object to handle the post request from DialogFlow

## Deploy
Now save and deploy the code and have a play. 
Go to https://console.actions.google.com/project/mealmaker-demo/simulator/
Here you're able to change the surface to a different type of device, so select speaker and kick off the conversation. Once you've given your protein and carb it will ask you if it can send the cards to your phone. Say yes and as if by magic they'll appear!
The notification should appear on any device that has a screen and linked to your Google account. When you click it, the card we built will appear with a button linking out to the recipe URL.

## Conclusion
I hope I've given you a flying tour of some of the capabilities of Actions on Google and how to develop and deploy your own Actions. My experience with the platform wasn't good from the outset. I found a lot of the links ended in 404s , the documentation had big holes in it and some of the more basic features (like adding multiple buttons to a single card) were missing.
Way too many of these from the DialogFlow docsIn the end, we made something fun but the process to get there needs to be improved if Google want to build a vibrant dev community around this.
Any questions, please post below and I'll do my best to answer them.