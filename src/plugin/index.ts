import { App } from 'vue'
import VueHttpButton from './VueHttpButton.vue'

export default {
	install(app: App) {
		app.component('VueHttpButton', VueHttpButton)
	}
}