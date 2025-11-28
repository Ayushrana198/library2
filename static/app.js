import home from './components/home.js'
import login from './components/login.js'
import signup from './components/signup.js'
import issue from './components/issue.js'
import user_dashboard from './components/user_dashboard.js'
import librarian_dashboard from './components/librarian_dashboard.js'
import readbook from './components/readbook.js'
import userbook from './components/userbook.js'



const router = new VueRouter({
    routes: [
        {path: '/', component: home },
        {path: '/issue', component: issue },
        {path: '/signup', component: signup},
        {path: '/login', component: login },
        {path: '/user_dashboard', component: user_dashboard},
        {path: '/librarian_dashboard', component: librarian_dashboard},
        { path: '/readbook/:bookId', component: readbook, name: 'readbook' },
        {path: '/userbook', component: userbook }
    ],
})


new Vue({
    el: '#app',
    delimiters: ['${','}'],
    router,
})