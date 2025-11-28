export default {
    template: `
      <div class="container mt-4">
        <h1 class="text-center mb-4">Books Issued to Students</h1>
        <div v-if="userbook.length === 0" class="text-center">
          <p>No books issued to students.</p>
        </div>
        <div v-else>
          <div v-for="book in userbook" :key="book.req_id" class="card mb-3">
            <div class="card-body">
              <h5 class="card-title"><b>Book Title:</b> {{ book.title }}</h5>
              <p class="card-text"><b>Expiry Date:</b> {{ book.expiry_date }}</p>
              <p class="card-text"><b>Issued to:</b> {{ book.username }}</p>
              <button @click="revokeBook(book)" class="btn btn-danger btn-sm">Revoke Book</button>
            </div>
          </div>
        </div>
        <!-- Add button to return to the librarian dashboard -->
        <div class="text-center mt-3">
          <button class="btn btn-primary" @click="$router.push('/librarian_dashboard')">Return to Librarian Dashboard</button>
        </div>
      </div>
    `,
    data() {
      return {
        userbook: []
      };
    },
    created() {
      this.fetchUserBooks();
    },
    methods: {
      fetchUserBooks() {
        fetch('/api/userbooks')
          .then(res => res.json())
          .then(data => {
            this.userbook = data.map(book => ({
                req_id: book.req_id,
                title: book.title,
                expiry_date: book.expiry_date,
                username: book.username 
            }));
          })
          .catch(error => {
            console.error('Error fetching user books:', error);
          });
      },
      revokeBook(book) {
        fetch(`/api/revoke-book/${book.req_id}`, {
          method: 'DELETE'
        })
        .then(() => {
          this.userbook = this.userbook.filter(b => b.req_id !== book.req_id);
        })
        .catch(error => {
          console.error('Error revoking book:', error);
        });
      }
    }
};
