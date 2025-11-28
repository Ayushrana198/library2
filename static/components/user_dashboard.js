export default {
  template: `
    <div class="container mt-5">
      <div class="card mb-4">
        <div class="card-header">
          <h1 class="card-title">User Dashboard</h1>
          <p>Welcome to the user dashboard! Check your books here 
             <button class="btn btn-primary" @click="$router.push('/issue')">My Books</button>
          </p>
        </div>

        <div class="card-body">
          <hr>
          <h2 class="card-title">Books to enjoy in Library!!</h2>
          <hr>
          
          <div class="mb-3">
              <label for="filter-input"><b>Search for your Book: </b></label>
              <input type="text" v-model="filter" class="form-control" id="filter-input" placeholder="Book Name">
              <button class="btn btn-success" @click="searchBook">Search</button>
          </div>
          
          <div v-for="section in filtered_sections" :key="section.sec_id" class="card mb-4">
            <div class="card-header">
              <h3 class="card-title">Section: {{ section.sec_name }}</h3>
              <p class="card-text">{{ section.description }}</p>
            </div>

            <div class="card-body">
              <div v-for="book in section.book" :key="book.book_id" class="mb-3">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title"><b>Book Name: </b>{{ book.title }}</h5>
                    <p class="card-text"><b>Author: </b>{{ book.author }}</p>
                    <p class="card-text"><b>Price: </b>{{ book.price }}</p>
                    <button class="btn btn-primary" @click="bookRequestForm(book)">Request</button>
                           <div v-if="bookRequest">
                               <h4>{{ requestedBook.title }}</h4>
                              <form @submit.prevent="requestBook">
                                 <button class="btn btn-success">Request</button>
                              </form>
                           </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      filter: '',
      sections: [],
      filtered_sections: [],
      bookRequest: false,
      request: [],
      user: null,
      requestedBook: null
    };
  },
  watch: {
    filter(newFilter) {
      if (!newFilter) {
        this.filtered_sections = this.sections;
      } else {
        this.filtered_sections = this.sections.filter(sections => sections.sec_name.toLowerCase().includes(newFilter.toLowerCase()));
      }
    },
  },
  created() {
    this.fetchSections();
  },
  methods: {
    fetchSections() {
      fetch('/api/sections')
        .then(res => res.json())
        .then(sections => {
          const promises = sections.map(sections => {
            return fetch(`/api/book/${sections.sec_id}`)
              .then(res => res.json())
              .then(book => {
                sections.book = book;
                console.log(sections);
                return sections;
              });
          });

          return Promise.all(promises);
        })
        .then(sections => {
          this.sections = sections;
          this.filtered_sections = sections;
        })
        .catch(err => {
          console.error('Error fetching sections:', err);
        });
    },
    bookRequestForm(book) {
      this.requestedBook = book;
      this.bookRequest = true;
    },
    requestBook() {
      const book = this.requestedBook;
      fetch('/api/user')
        .then(res => res.json())
        .then((data) => {
          const user_id = data.response.user_id;
          return fetch(`/api/request-book/${user_id}/${book.book_id}/${book.title}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({book_id : book.book_id, user_id: user_id})
          });
        })
        .then(res => res.json())
        .then(request => {
          this.request.push(request);
          this.bookRequest = false;
          this.fetchSections();
          this.filter = '';
        })
        .catch(err => {
          console.log('Error requesting book', err);
        });
    },
    fetchRequestedBooks() {
      fetch('/api/requested-books')
        .then(res => res.json())
        .then(data => {
          this.requestedBooks = data;
        })
        .catch(err => {
          console.error('Error fetching requested books:', err);
        });
    },
    searchBook() {
      fetch(`/api/search/books?term=${this.filter}`)
          .then(res => res.json())
          .then(books => {
              this.filtered_sections = [{
                  sec_id: 'search_results', 
                  sec_name: 'Search Results', 
                  book: books 
              }];
          })
          .catch(err => {
              console.error('Error searching books:', err);
          });
      }
  }
};
