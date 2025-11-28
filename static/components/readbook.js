export default {
    template: `
      <div class="container mt-4">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title text-center">{{ book.title }}</h2>
            <p class="card-text">{{ book.description }}</p>
            <button class="btn btn-primary" @click="$router.push('/issue')">Read Another Book</button>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        book: {
          title: '',
          description: '',
        },
      };
    },
    created() {
      this.fetchBook();
    },
    methods: {
      fetchBook() {
        const bookId = this.$route.params.bookId;
        fetch(`/api/book/${bookId}/description`)
          .then(res => res.json())
          .then(data => {
            this.book.title = data.title;
            this.book.description = data.description;
          })
          .catch(error => {
            console.error('Error fetching book description:', error);
          });
      },
    },
  };
  