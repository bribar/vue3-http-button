<script setup lang="ts">
	import { ref } from 'vue'
	const data = ref(null)
	const handleResponse = (payload: any) => {
		data.value = payload
	}
</script>

<template>
	
  	<vue-http-button
		v-on:http-response="handleResponse"
	>
		<template #default="scoped">
			{{ scoped.text }}
		</template>
	</vue-http-button>

	<div>{{ data }}</div>

</template>
