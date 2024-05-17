<script setup lang="ts">
	import { mergeProps, ref } from 'vue'
	import { arrow, flip, offset, useFloating } from '@floating-ui/vue'

	const props = defineProps({
		class: {
			type: String,
			required: false,
			default: 'http-button'
		},
		buttonText: {
			type: String,
			required: false,
			default: 'SAVE'
		},
		loadingText: {
			type: String,
			required: false,
			default: 'SAVING'
		},
		tooltip: {
			type: Object,
			required: false,
			default(rawProps: any) {
				const defaultOptions: any = {
					placement: 'top',
					offset: 15
				}
				return mergeProps(defaultOptions, rawProps)
			}
		},
		request: {
			type: Object,
			required: false,
			default(rawProps: any) {
				const defaultOptions: any = {
					url: 'https://jsonplaceholder.typicode.com/posts',
					options: {
						method: 'GET', // *GET, POST, PUT, DELETE, etc.
						mode: 'cors', // no-cors, *cors, same-origin
						cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
						credentials: 'same-origin', // include, *same-origin, omit
						headers: {
							'Content-Type': 'application/json; charset=UTF-8',
						},
						redirect: 'follow', // manual, *follow, error
						referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
						body: {}
					}
				}

				let props: any = mergeProps(defaultOptions, rawProps)
				props.options.body = JSON.stringify(props.options.body)
				
				if(props.options.method === 'DELETE'){
					props.options = {
						method: 'DELETE'
					}
				}

				if(props.options.method == 'GET'){
					props.options = null
				}

				return props
				
			}
		},
		response: {
			type: Object,
			required: false,
			default(rawProps: any) {

				const defaultProps = {
					enabled: true,
					map: {
						status: 'status',
						message: 'statusText',
						data: 'payload'
					},
					status: 'success',
					message: 'Saved',
					duration: 0
				}

				return mergeProps(defaultProps, rawProps)
			}
		}
	})

	const emit = defineEmits(['http-response'])

	const buttonText = ref(props.buttonText)

	const target = ref(null)
	const tooltip = ref(null)
	const tooltipArrow = ref(null)
	const showTooltip = ref(false)
	
	const {floatingStyles, middlewareData, placement} = useFloating(
		target,
		tooltip,
		{
			placement: props.tooltip.placement,
			middleware: [
				arrow({
					element: tooltipArrow
				}),
				offset(props.tooltip.offset),
				flip()
			]
		}
	)

	const requesting = ref(false)
	const httpStatus = ref()
	const httpMessage = ref()
	const makeRequest = (() => {
		
		if(requesting.value){
			return
		}

		requesting.value = true
		
		fetch(props.request.url, props.request.options)
			.then((response: any) => {
				if(!response.ok){
					throw new Error(response.status);
				}
				return response.json()
			})
			.then((data) => {
				handleResponse(data)
			})
			.catch((error) => {
				handleError(error)
			})
			.finally(() => {
				requesting.value = false
			})

	})

	const handleResponse = (payload: any): any => {
		
		httpStatus.value = props.response.status.toLowerCase().replace(' ', '-')
		if(props.response.map.status in payload){
			httpStatus.value = payload[props.response.map.payload].toLowerCase().replace(' ', '-')
		}

		httpMessage.value = props.response.message
		if(props.response.map.message in payload){
			httpMessage.value = payload[props.response.map.message]
		}

		if(props.response.map.data in payload){
			payload = payload[props.response.map.data]
		}

		if(props.response.enabled){

			showTooltip.value = true

			if(props.response.duration != 0){
				setTimeout(() => {
					showTooltip.value = false
				}, props.response.duration)
			}

		}

		emit('http-response', payload)

		return payload
		
	}

	const handleError = (error: any): void => {

		showTooltip.value = true
		httpStatus.value = 'failed'
		httpMessage.value = error.message
		if(props.response.duration != 0){
			setTimeout(() => {
				showTooltip.value = false
			}, props.response.duration)
		}

	}

</script>

<template>
	<div v-if="showTooltip" ref="tooltip" :style="floatingStyles" :class="['http-tooltip', httpStatus]">
		<div :class="['http-tooltip-inner']">
			<div class="tooltip-icon" @click="showTooltip = false"></div>
			<div class="tooltip-message">
				{{ httpMessage }}
			</div>
		</div>
		<div
			:class="['http-tooltip-arrow', placement]"
			ref="tooltipArrow"
			:style="{
				position: 'absolute',
				left:
					middlewareData.arrow?.x != null
						? `${middlewareData.arrow.x}px`
						: '',
				top:
					middlewareData.arrow?.y != null
						? `${middlewareData.arrow.y}px`
						: ''
			}"
		></div>
	</div>

    <button 
		:class="props.class"
		@click="makeRequest"
		ref="target"
	>
		<!-- 
		* SHOW DEFAULT LOADING ICON IF NO LOADER SLOT PROVIDED
		-->
		<slot v-if="$slots.loader && requesting" name="loader"></slot>
		<span v-if="!$slots.loader && requesting">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="18px" height="18px"><linearGradient id="a11"><stop offset="0" stop-color="#222222" stop-opacity="0"></stop><stop offset="1" stop-color="#222222"></stop></linearGradient><circle fill="none" stroke="url(#a11)" stroke-width="15" stroke-linecap="round" stroke-dasharray="0 44 0 44 0 44 0 44 0 360" cx="100" cy="100" r="70" transform-origin="center"><animateTransform type="rotate" attributeName="transform" calcMode="discrete" dur="2" values="360;324;288;252;216;180;144;108;72;36" repeatCount="indefinite"></animateTransform></circle></svg>
		</span>
	
		<span><slot :text="requesting ? loadingText : buttonText"></slot></span>
	
	</button>
</template>

<style scoped lang="scss">

	.http-button {
		box-shadow: inset 0px 1px 0px 0px #ffffff;
		background: linear-gradient(to bottom, #f9f9f9 5%, #e9e9e9 100%);
		background-color:#f9f9f9;
		border-radius: 20px;
		border: 1px solid #dcdcdc;
		display: flex;
		gap: 5px;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color:#666666;
		font-family: Arial;
		font-size: 18px;
		line-height: 18px;
		font-weight: bold;
		padding: 0.5em 1.2em;
		text-decoration: none;
		text-shadow: 0px 1px 0px #ffffff;
		outline: none;

		&:hover{
			background: linear-gradient(to bottom, #e9e9e9 5%, #f9f9f9 100%);
			background-color:#e9e9e9;
		}
		&:focus, &:focus-visible{
			outline: none;
		}
		&:active{
			position: relative;
			top: 1px;
		}
	}

	.http-tooltip{
		width: max-content;
		box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, .2);
		border-radius: 8px;
		
		.http-tooltip-inner{
			padding: 5px 10px;
			display: flex;
			align-items: center;

			.tooltip-icon{
				flex: none;
			}
			.tooltip-message{
				flex: 1;
			}
		}

		.http-tooltip-arrow{
			position: absolute;
			width: 10px;
			height: 10px;
			background: white;
			transform: rotate(45deg);
			
			&.left, &.left-start, &.left-end{
				right: -5px;
				box-shadow: 3px -3px 4px 0px rgba(0, 0, 0, .1);
			}
			&.right, &.right-start, &.right-end{
				left: -5px;
				box-shadow: -3px 3px 4px 0px rgba(0, 0, 0, .1);
			}
			&.bottom, &.bottom-start, &.bottom-end{
				top: -5px;
				box-shadow: -3px -3px 4px 0px rgba(0, 0, 0, .1);
			}
			&.top, &.top-start, &.top-end{
				bottom: -5px;
				box-shadow: 3px 3px 4px 0px rgba(0, 0, 0, .1);
			}
		}

		.tooltip-icon{
			width: 18px;
			height: 18px;
			display: inline-block;
			margin-right: 2px;
			background-repeat: no-repeat;
			cursor: pointer;
		}

		&.success{
			background-color: darkgreen;
			color: #fff;

			.http-tooltip-arrow{
				background-color: darkgreen;
			}

			.tooltip-icon{
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3C!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--%3E%3Cpath d='M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z' fill='%23fff'/%3E%3C/svg%3E");
			}
		}

		&.failed{
			background-color: firebrick;
			color: #fff;

			.http-tooltip-arrow{
				background-color: firebrick;
			}

			.tooltip-icon{
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'%3E%3C!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--%3E%3Cpath d='M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z' fill='%23fff'/%3E%3C/svg%3E");
			}
		}
	}

</style>