const {
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const { ConfirmEmailDialog, CONFIRM_EMAIL_DIALOG } = require('./confirmEmailDialog');
const { ConfirmStudentNumberDialog, CONFIRM_STUDENT_NUMBER_DIALOG } = require('./confirmStudentNumberDialog');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const STUDENTNUMBER_PROMPT = 'STUDENTNUMBER_PROMPT';
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

        this.addDialog(new ConfirmEmailDialog());
        this.addDialog(new ConfirmStudentNumberDialog());

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.problemSelectionStep.bind(this),
            this.problemSelectionConfirmStep.bind(this),
            this.passwordResetStep.bind(this),
            this.passwordResetConfirmStep.bind(this),
            this.confirmStep.bind(this),
            this.goodbyeStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

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
        const reply = { attachments:
            [CardFactory.heroCard(
                'What can I help you with?',
                'Select an option.',
                [],
                ['Reset password', 'F.A.Q.', 'Tuition fees']
            )] };
        await step.context.sendActivity(reply);
        return await step.prompt(PROBLEM_PROMPT, '');
    }

    async problemSelectionConfirmStep(step) {
        console.log(step.result);
        if (step.result === 'Reset password') {
            // Should add separate dialog for password reset
            return await step.prompt(CONFIRM_PROMPT, `You selected: ${ step.result }. Is this correct?`, [`Yes`, `No`]);
        } if (step.result === 'F.A.Q.') {
            await step.context.sendActivity('Not yet implemented.');
            return await step.endDialog();
        } if (step.result === 'Tuition fees') {
            await step.context.sendActivity('Not yet implemented.');
            return await step.endDialog();
        } else {
            await step.context.sendActivity('Not a valid option.');
            return await step.endDialog();
        }
    }

    async passwordResetStep(step) {
        console.log(step.result);
        if (step.result === true) {
            return await step.prompt(CONFIRM_PROMPT, 'Are you familiar with the current reset tool?', ['Yes', 'No']);
        } else {
            await step.context.sendActivity('Not in happy flow :(');
            return await step.endDialog();
            // return await step.replaceDialog();
        }
    }

    async passwordResetConfirmStep(step) {
        console.log(step.result);
        if (step.result === true) {
            await step.context.sendActivity('Please follow this link to reset your password.');
            await step.context.sendActivity('https://aka.ms/sspr');
            await step.context.sendActivity('Je kunt altijd weer bij mij terecht voor FAQ of password assistentie. Fijne dag verder!');
            // End dialogue
            return step.endDialog();
        } if (step.result === false) {
            return await step.beginDialog(CONFIRM_STUDENT_NUMBER_DIALOG);
        }
    }

    async confirmStep(step) {
        console.log('Step after student number dialog: ' + step.result);
        if (step.result === true) {
            return await step.beginDialog(CONFIRM_EMAIL_DIALOG);
        } else {
            return await step.next();
        }
    }

    async goodbyeStep(step) {
        console.log('Entering goodbye step: ' + step.result);
        if (step.result === true) {
            await step.context.sendActivity('Amazing! Glad I could help you today.');
            await step.context.sendActivity('Je kunt altijd weer bij mij terecht voor FAQ of password assistentie. Fijne dag verder!');
            return await step.endDialog();
        } if (step.result === false) {
            await step.context.sendActivity(`Sorry, I couldn't help you. Try contacting the student help desk.`);
            await step.context.sendActivity('Je kunt altijd weer bij mij terecht voor FAQ of password assistentie. Fijne dag verder!');
            return await step.endDialog();
        } else {
            await step.context.sendActivity('End reached.');
            return await step.endDialog();
        }
    }
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;
