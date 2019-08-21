// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const STUDENTNUMBER_PROMPT = 'STUDENTNUMBER_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const PROBLEM_PROMPT = 'PROBLEM_PROMPT';
const MAIN_DIALOG = 'MAIN_DIALOG';

class MainDialog extends ComponentDialog {
    constructor(userState) {
        super(MAIN_DIALOG);

        this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new TextPrompt(PROBLEM_PROMPT));
        this.addDialog(new TextPrompt(STUDENTNUMBER_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.studentNumberValidator));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.problemSelectionStep.bind(this),
            this.problemSelectionConfirmStep.bind(this),
            this.passwordResetStep.bind(this),
            this.passwordResetConfirmStep.bind(this),
            this.studentNumberStep.bind(this),
            this.confirmStep.bind(this),
            this.summaryStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async problemSelectionStep(step) {
        await step.context.sendActivity('Welcome. My name is Holly, the virtual assistant.');
        const reply = { attachments:
            [CardFactory.heroCard(
                'What can I help you with?',
                'Choose an option.',
                [],
                ['Reset password', 'F.A.Q.', 'Tuition fees']
            )] };
        await step.context.sendActivity(reply);
        return await step.prompt(PROBLEM_PROMPT, 'Select an option.');
    }

    async problemSelectionConfirmStep(step) {
        return await step.prompt(CONFIRM_PROMPT, `You selected: ${ step.result }. Is this correct?`, [`Yes`, `No`]);
    }

    async passwordResetStep(step) {
        if (step.result) {
            return await step.prompt(CONFIRM_PROMPT, 'Are you familiar with the currenct reset tool?', ['Yes', 'No']);
        } else {
            return await step.next('No');
        }
    }

    async passwordResetConfirmStep(step) {
        if (step.result) {
            await step.context.sendActivity(`You've entered: ${ step.result }.`);
            await step.context.sendActivity('Please follow this link to reset your password.');
            // Insert url to reset password
            await step.context.sendActivity('PLACEHOLDER_FOR_URL');
            await step.context.sendActivity('Je kunt altijd weer bij mij terecht voor FAQ of password assistentie. Fijne dag verder!');
            // End dialogue
            return step.endDialog();
        } else {
            // Not familiar with resettool
            // Needs to have checks in place for the studentnumbers, only allowed to enter 3 times total.
            // On retry prompt add image of where to find the student number.
            const promptOptions = { prompt: 'Please enter your studentnumber.', retryPrompt: 'Not correct student number. You can find this on your student card. Enter it again.' };
            return await step.prompt(NUMBER_PROMPT, promptOptions);
        }
    }

    async studentNumberStep(step) {
        await step.context.sendActivity(`I've got your student number noted as ${ step.result }.`);
        return await step.prompt(CONFIRM_PROMPT, { prompt: 'Is this correct?' });
    }

    async confirmStep(step) {
        if (step.result) {
            await step.context.sendActivity(`I've send an email corresponding to the student number.`);
            return await step.prompt(CONFIRM_PROMPT, { prompt: 'Please confirm that you have recieved an email, make sure to check your spam folder.' });
        } else {
            return await step.next(this.confirmStep(this));
        }
    }

    async summaryStep(step) {
        if (step.result) {
            await step.context.sendActivity('Amazing! Glad I could help you today.');
            await step.context.sendActivity('Je kunt altijd weer bij mij terecht voor FAQ of password assistentie. Fijne dag verder!');
            return await step.endDialog();
        } if (!step.result) {
            await step.context.sendActivity('Make sure to check your spam folder. Please refresh your inbox.');
            await step.context.sendActivity('Je kunt altijd weer bij mij terecht voor FAQ of password assistentie. Fijne dag verder!');
            return await step.endDialog();
        } else {
            await step.context.sendActivity('End reached.');
            return await step.endDialog();
        }
    }

    async studentNumberValidator(promptContext) {
        // This condition is our validation rule. You can also change the value at this point.
        return promptContext.recognized.succeeded && promptContext.recognized.value > 0 && promptContext.recognized.value < 999999;
    }
}

module.exports.MainDialog = MainDialog;
