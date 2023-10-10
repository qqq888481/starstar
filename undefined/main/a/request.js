import Axios from 'axios'

export default class Request {
    static getJson(url, callback) {
        Axios.get(url).then(r => {
            callback(r.data);
        })
    }
}
