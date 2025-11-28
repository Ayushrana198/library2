export default {
  template: `
    <div class="container mt-4">
      <div class="card-header">
        <h1 class="text-center mb-4" >Search and Manage Your Requested Books
        <button class="btn btn-primary" @click="$router.push('/user_dashboard')">Request Another Book</button>
        </h1>
      </div>
      <div class="row">
        <div v-for="request in requests" :key="request.req_id" class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title"><b>Book Name:</b> {{ request.title }}</h5>
              <p class="card-text"><b>Requested Date:</b> {{ request.request_date }}</p>
              <p class="card-text"><b>Expiry Date:</b> {{ request.expiry_date }}</p>
              <router-link :to="{ name: 'readbook', params: { bookId: request.book_id } }" class="btn btn-info btn-sm mb-2">Read</router-link>
              <button @click="deleteRequest(request)" class="btn btn-danger btn-sm mb-2">Return the Book</button>
              <button @click="giveFeedback(request)" class="btn btn-primary btn-sm">Give Feedback</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      requests: [],
    };
  },
  created() {
    this.fetchRequests();
  },
  methods: {
    fetchRequests() {
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          const userId = data.response.user_id;
          return fetch(`/api/request-book/${userId}`);
        })
        .then(requestRes => requestRes.json())
        .then(requestData => {
          this.requests = requestData;
        })
        .catch(error => {
          console.error('Error fetching requests:', error);
        });
    },
    deleteRequest(request) {
      fetch('/api/user')
        .then(response => response.json())
        .then(data => {
          const userId = data.response.user_id;
          return fetch(`/api/request-book/${userId}/${request.book_id}/${request.title}/${request.req_id}`, {
            method: 'DELETE'
          });
        })
        .then(() => {
          this.fetchRequests();
        })
        .catch(error => {
          console.error('Error deleting request:', error);
        });
    },
    giveFeedback(request) {
      const feedback = prompt('Please provide your feedback:');
      if (feedback) {
        fetch(`/api/feedback/${request.user_id}/${request.book_id}/${request.title}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feedback }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to submit feedback');
            }
            console.log('Feedback submitted successfully.');
          })
          .catch(error => {
            console.error('Error submitting feedback:', error);
          });
      }
    },
  },
};
