export default {
    template: `
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-4">
                    <h2 class="text-center mb-4">Login</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="mb-3">
                                <input type="email" class="form-control" placeholder="Email" v-model="credential.email" />
                            </div>
                            <div class="mb-3">
                                <input type="password" class="form-control" placeholder="Password" v-model="credential.password" />
                            </div>
                            <button class="btn btn-primary w-100" @click="loginUser">Login</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            credential: {
                email: null,
                password: null,
            },
        };
    },
    methods: {
        loginUser() {
            fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                body: JSON.stringify(this.credential),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log(data.response.user.authentication_token);
                localStorage.setItem('authToken', data.response.user.authentication_token);
                this.fetchUserData();
            })
            .catch((error) => {
                console.error('Login error:', error);
            });
        },
        fetchUserData() {
            const authToken = localStorage.getItem('authToken');
            fetch('/api/user', {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            })
            .then((res) => res.json())
            .then((data) => {
                const userRoles = data.response.roles;
                if (userRoles.includes('librarian')) {
                    this.$router.push('/librarian_dashboard');
                } else {
                    this.$router.push('/user_dashboard');
                }
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
        },
    },
};
