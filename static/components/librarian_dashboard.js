export default {
  template: `
    <div class="container mt-4">
      <h1 class="text-center mb-4" >Welcome to Librarian's Dashboard</h1>
      <hr>

      <h3 class="text-center">Sections & Books Trending</h3>
      <div class="row mb-4">
        <!-- Display Sections as Cards -->
        <div v-for="section in sections" :key="section.sec_id" class="col-md-6 mb-4">
        
          <!-- Edit Section Form -->
          <div v-if="editSectionForm.sec_id === section.sec_id">
              <input v-model="editSectionForm.sec_name" placeholder="Section Name" class="form-control mb-2">
              <input v-model="editSectionForm.description" placeholder="Description" class="form-control mb-2">
              <button class="btn btn-primary" @click="editSectionSave">Save Section</button>
          </div>

          <div class="card">
            <div class="card-header">
              <h4>{{ section.sec_name }}</h4>
            </div>
            <div class="card-body">
              <p><b>Description:</b> {{ section.description }}</p>
              <div class="mb-3">
                <button class="btn btn-secondary btn-sm mr-2" @click="editSection(section)">Edit Section</button>
                <button class="btn btn-danger btn-sm" @click="deleteSection(section)">Delete Section</button>
              </div>

              <!-- Display Books as Cards -->
              <div v-for="book in section.book" :key="book.book_id" class="card mb-2">
                <div class="card-body">
                  <h5><b>Book Title:</b> {{ book.title }}</h5>
                  <p><b>Author:</b> {{ book.author }}</p>
                  <div class="mb-3">
                    <button class="btn btn-secondary btn-sm mr-2" @click="editBook(book)">Edit Book</button>
                    <button class="btn btn-danger btn-sm" @click="deleteBook(book)">Delete Book</button>
                  </div>

                  <!-- Edit Book Form -->
                  <div v-if="editBookForm.book_id === book.book_id && editBookForm.sec_id === section.sec_id">
                    <input v-model="editBookForm.title" placeholder="Book Name" type="text" class="form-control mb-2">
                    <input v-model="editBookForm.author" placeholder="Author" type="text" class="form-control mb-2">
                    <input v-model="editBookForm.description" placeholder="Description" type="text" class="form-control mb-2">
                    <input v-model="editBookForm.price" placeholder="Price" type="number" class="form-control mb-2">
                    <button class="btn btn-primary" @click="editBookSave">Save Book</button>
                  </div>
                </div>
              </div>
              <br>

              <!-- Add new book form -->
              <h5>Add New Book to Section</h5>
              <div class="form-group">
                <input v-model="new_book.sec_id" placeholder="section_id" type="number" class="form-control mb-2">
                <input v-model="new_book.title" class="form-control mb-2" placeholder="Book Title" type="text">
                <input v-model="new_book.author" class="form-control mb-2" placeholder="Author" type="text">
                <input v-model="new_book.description" class="form-control mb-2" placeholder="Description" type="text">
                <input v-model="new_book.price" class="form-control mb-2" placeholder="Price" type="number">
                <button class="btn btn-primary" @click="createBook(section)">Add Book</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Create new section form -->
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h4>Create New Section</h4>
            </div>
            <div class="card-body">
              <div class="form-group">
                <input v-model="newSection.sec_name" class="form-control mb-2" placeholder="Section Name" type="text">
                <input v-model="newSection.description" class="form-control mb-2" placeholder="Description" type="text">
                <button class="btn btn-primary" @click="createSection">Create Section</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export button -->
      <div class="text-center">
        <button class="btn btn-secondary mb-4" @click="export_sections">Export Sections with Books</button>
      </div>

      <!-- Books Issued to Students button -->
      <div class="text-center">
        <button class="btn btn-primary" @click="$router.push('/userbook')">Books Issued to Students</button>
      </div>
    </div>
  `,
  data() {
    return {
        
        newSection: {
            sec_name: "",
            description: "",
        },
        sections: [],
        editSectionForm: {
            sec_id: null,
            sec_name: "",
            description: "",
        },
        book: {
          book_id: null,
          title: "",
          author: "",
          description: "",
          price: null,
          sec_id: null, 
        },
        new_book: {
            sec_id: null,
            title: "",
            author: "",
            description: "",
            price: null, 
        },
        editBookForm: {
          sec_id: null,
          book_id: null,
          title: "",
          author: "",
          description: "",
          price: null,
        }
    };
},
created() {
    this.fetchSections()
},
methods: {
  fetchSections() {
    let user_id;
  
    fetch('/api/user') 
      .then(res => res.json())
      .then(data => {
        user_id = data.response.user_id;
  
        return fetch(`/api/sections/${user_id}`);
  
      })
      .then(sectionsRes => sectionsRes.json())
      .then(sectionsData => {
        const sectionsPromises = sectionsData.map(sections => {
  
          return fetch(`/api/book/${user_id}/${sections.sec_id}`)
            .then(bookRes => bookRes.json())
            .catch(err => {
              console.log('No book in this Section', sections.sec_id);
              return [];  
            })
            .then(book => {
              sections.book = book;
              console.log(sections)
              return sections;
            });
  
        });
        
        return Promise.all(sectionsPromises);
        
      })
      .then(sections => {
        this.sections = sections;
      })
      .catch(err => {
        console.error('Error fetching sections', err);
      });
  
  },
  createSection() {
    fetch('/api/user')
      .then((response) => response.json())
      .then((data) => {
        const user_id = data.response.user_id
        return fetch(`/api/sections/${user_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.newSection),
        })
      })
      .then((response) => response.json())
      .then((data) => {
        this.sections.push(data)
        this.newSection={
          sec_name: '',
          description: '',
        }
      })
      .catch((error) => {
        console.error('Error creating Section:', error);
      })
   },
    editSection(section) {
        this.editSectionForm.sec_id = section.sec_id;
        this.editSectionForm.sec_name = section.sec_name;
        this.editSectionForm.description = section.description;
    },
    editSectionSave() {
      fetch('/api/user')
        .then((response) => response.json())
        .then((data) => {
          const user_id = data.response.user_id;
          return fetch(`/api/sections/${user_id}/${this.editSectionForm.sec_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.editSectionForm),
          });
        })
        .then(() => {
          const index = this.sections.findIndex((sections) => sections.sec_id === this.editSectionForm.sec_id);
          if (index !== -1) {
            this.sections[index] = this.editSectionForm;
          }
          this.editSectionForm = {
            sec_id: null,
            sec_name: '',
            description: '',
          };
        })
        .catch((error) => {
          console.error('Error updating Section:', error)
        });
    },
    deleteSection(section){
      fetch('/api/user')
        .then((response) => response.json())
        .then((data) => {
          const user_id = data.response.user_id
          return fetch(`/api/sections/${user_id}/${section.sec_id}`, {
            method: 'DELETE'
          })
        })
        .then(() => {
          const index = this.section.findIndex((h) => h.sec_id === section.sec_id);
          if (index !== -1) {
            this.section.splice(index, 1);
        }
        })
        .catch((error) => {
          console.error('Error deleting Section:', error)
        })
    },
    createBook() {
      fetch('/api/user')
        .then((response) => response.json())
        .then((data) => {
          const user_id = data.response.user_id;
          return fetch(`/api/book/${user_id}/${this.new_book.sec_id}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(this.new_book),
          });
        })
        .then((response) => {
          if (response.status === 201) {
              return response.json();
          } else {
              throw new Error('Failed to create book');
          }
        })
        .then((data) => {
          this.fetchSections();
          
          this.new_book = {
              sec_id: null,
              title: "",
              author: "",
              description: "",
              price: null,
              
          };
        })
        .catch((error) => {
          console.error('Error creating book:', error);
        });
    },
    editBook(book) {
        this.editBookForm.sec_id = book.sec_id;
        this.editBookForm.book_id = book.book_id;
        this.editBookForm.title = book.title;
        this.editBookForm.author = book.author;
        this.editBookForm.description = book.description;
        this.editBookForm.price = book.price;
    },
    editBookSave() {
      fetch('/api/user')
        .then((response) => response.json())
        .then((data) => {
          const user_id = data.response.user_id;
          return fetch(`/api/book/${user_id}/${this.editBookForm.sec_id}/${this.editBookForm.book_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.editBookForm),
          });
        })
        .then((response) => {
          if (response.status === 200) {
            this.fetchSections(); 
            this.editBookForm = {
              sec_id: null,
              book_id: null,
              title: '',
              author: '',
              description: '',
              price: null,
            };
          } else {
            throw new Error('Failed to update book');
          }
        })
        .catch((error) => {
          console.error('Error updating Book:', error);
        });
    },
    deleteBook(book) {
      fetch('/api/user')
        .then((response) => response.json())
        .then((data) => {
          const user_id = data.response.user_id;
          return fetch(`/api/book/${user_id}/${book.sec_id}/${book.book_id}`, {
            method: 'DELETE',
          });
        })
        .then((response) => {
          if (response.status === 200) {
            this.fetchSections(); 
          } else {
            throw new Error('Failed to delete book');
          }
        })
        .catch((error) => {
          console.error('Error deleting Book:', error);
        });
    },
    export_sections: function () {
       window.open('/export_sections', '_blank').focus();
    }
},
};