var axios = require('axios');
const LOCAL_API = 'http://192.168.0.21:8080/RESTfulProject/REST/WebService/GetCustomers';
const EXTERNAL_API = 'Some URL like www.nihilent.com';

const API = {
  getCustomers: () => (
    axios.get(LOCAL_API)
      .then(data => data)
      .catch(data =>{})
  )
};
export default API
