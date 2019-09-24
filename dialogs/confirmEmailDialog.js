const { ComponentDialog, ConfirmPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';

const CONFIRM_EMAIL_DIALOG = 'CONFIRM_EMAIL_DIALOG';

var failCounter = 0;

class ConfirmEmailDialog extends ComponentDialog {
    constructor() {
        super(CONFIRM_EMAIL_DIALOG);
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.emailStep.bind(this),
            this.emailConfirmStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async emailStep(step) {
        if (failCounter <= 0) {
            await step.context.sendActivity(`I've send you an email corresponding to the entered student number.`);
            return await step.prompt(CONFIRM_PROMPT, 'Did you receive the email?', ['Yes', 'No']);
        } if (failCounter === 1 || failCounter === 2) {
            console.log('Fail #' + failCounter);
            await step.context.sendActivity(`I've send another email.\n Try checking your spam folder.`);
            return await step.prompt(CONFIRM_PROMPT, 'Did you receive the email?', ['Yes', 'No']);
        } if (failCounter === 3) {
            console.log('Fail #' + failCounter + '. Exit loop.');
            return await step.endDialog(false);
        }
    }

    async emailConfirmStep(step) {
        console.log('Email step: ' + step.result);
        if (step.result === true) {
            failCounter = 0;
            return await step.endDialog(true);
        } else {
            console.log('Looping email step. #' + failCounter);
            failCounter++;
            return await step.replaceDialog(CONFIRM_EMAIL_DIALOG);
        }
    }
}

module.exports.ConfirmEmailDialog = ConfirmEmailDialog;
module.exports.CONFIRM_EMAIL_DIALOG = CONFIRM_EMAIL_DIALOG;
