export default {
    template: `
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-4">
                    <h2 class="text-center mb-4">Signup</h2>
                    <div class="card">
                        <div class="card-body">
                            <form @submit.prevent="onSubmit">
                                <div class="mb-3">
                                    <input type="text" class="form-control" placeholder="Username" v-model="username" />
                                </div>
                                <div class="mb-3">
                                    <input type="email" class="form-control" placeholder="Email" v-model="email" />
                                </div>
                                <div class="mb-3">
                                    <input type="password" class="form-control" placeholder="Password" v-model="password" />
                                </div>
                                <div class="mb-3">
                                    <input type="text" class="form-control" placeholder="Roles" v-model="roles" />
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Submit</button>
                            </form>
                            <p v-if="message" class="text-center mt-3">{{ message }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            username: '',
            email: '',
            password: '',
            roles: '', 
            message: '' 
        };
    },
    methods: {
        async onSubmit() {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.username,
                    email: this.email,
                    password: this.password,
                    roles: this.roles,
                })
            });
            
            if (response.ok) {
                this.message = 'Signup successful!';
            } else {
                this.message = 'Signup failed. Please try again.';
            }
        }
    }
};
