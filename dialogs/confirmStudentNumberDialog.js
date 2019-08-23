const { ComponentDialog, NumberPrompt, ConfirmPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

var validStudentNumber;
var validCounter = 0;

const CONFIRM_STUDENT_NUMBER_DIALOG = 'CONFIRM_STUDENT_NUMBER_DIALOG';

class ConfirmStudentNumberDialog extends ComponentDialog {
    constructor() {
        super(CONFIRM_STUDENT_NUMBER_DIALOG);
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.studentNumberValidator));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.studentNumberStep.bind(this),
            this.studentNumberConfirmStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async studentNumberStep(step) {
        const promptOptions = { prompt: 'Please enter your 6 digit student number. (123456)', retryPrompt: 'Invalid student number. You can find it on your student card.\n Please enter it again.' };
        return await step.prompt(NUMBER_PROMPT, promptOptions);
    }

    async studentNumberConfirmStep(step) {
        console.log(step.result);
        this.checkStudentNumber(step.result);
        if (validStudentNumber === true && validCounter === 0) {
            console.log('Valid student number');
            return await step.endDialog(true);
        } if (validStudentNumber === false) {
            await step.context.sendActivity('Invalid student number. You can find it on your student card.\n Please enter it again.');
            return await step.replaceDialog(CONFIRM_STUDENT_NUMBER_DIALOG);
        } if (validStudentNumber === false && validCounter === 2) {
            return await step.endDialog(false);
        }
    }

    async checkStudentNumber(studentNumber) {
        if (studentNumber === 123456) {
            validStudentNumber = true;
            validCounter = 0;
        } else {
            validStudentNumber = false;
            validCounter++;
        }
    }

    async studentNumberValidator(promptContext) {
        // Fix validator
        if (promptContext.recognized.succeeded && promptContext.attemptCount < 3 && promptContext.recognized.value > 0 && promptContext.recognized.value < 999999) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports.ConfirmStudentNumberDialog = ConfirmStudentNumberDialog;
module.exports.CONFIRM_STUDENT_NUMBER_DIALOG = CONFIRM_STUDENT_NUMBER_DIALOG;
