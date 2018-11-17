/**
 * @property {HTMLElement} form
 */
export class Login {
    /**
     * @param {HTMLElement} form
     */
    constructor(form) {
        this.form = form;

        this.addListeners();
    }

    addListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    /**
     * @param {Event} event
     */
    handleSubmit(event) {
        this.setLoading(true);
        this.postData()
            .then((data = {}) => {
                const { success } = data;

                this.setSuccess(success);
            })
            .catch(() => {
                this.setSuccess(false);
            });

        event.preventDefault();
    }

    setLoading(state) {
        const strings = [ 'Log in', 'Logging in...' ];
        const text = strings[ Number(state) % strings.length ];

        const submitButton = this.getSubmitButton();

        submitButton.value = text;
    }

    getSubmitButton() {
        return this.form.querySelector('input[type="submit"]');
    }

    setSuccess(state) {
        this.setLoading(false);

        if (!state)
            return;

        window.location.href = 'admin';

        this.getSubmitButton().value = 'Success. Redirecting...';
    }

    postData() {
        const opts = {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify(this.formData()),
        };

        return (
            fetch(this.form.action, opts)
                .then((res) => res.json())
        );
    }

    formData() {
        const formData = new FormData(this.form);
        return (
            Array.from(formData)
                 .reduce((acc, [ k, v ]) => Object.assign(acc, { [ k ]: v }), {})
        );
    }

}

window[ 'Login' ] = Login;
