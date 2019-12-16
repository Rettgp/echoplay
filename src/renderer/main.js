import Vue from 'vue'

import App from './App'
import router from './router'

// style
import "bootstrap/dist/css/bootstrap.css";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faMicrophone);
Vue.component('font-awesome-icon', FontAwesomeIcon);


// 3rd party components

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
