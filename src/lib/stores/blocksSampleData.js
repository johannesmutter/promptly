export const sampleData = {
	'cdfd5205-aade-4847-8789-487e41d7ff3f': {
		type: 'prompt',
		text: 'Travel Planner',
		annotations: ['bold'],
		children: [
			{text: 'Create a travel itinerary for ' },
			{id: '5ebdae0f-5913-4eca-857d-51042c4f9095', annotations: ['bold'] }, // text: 'main travel destination', 
			{text: ' and ' },
			{id: '2cd38d2e-aa60-4864-92eb-69a7acd2307a' }, // text: 'list of locations', 
			{text: ', starting on ' },
			{id: '3c71b7f8-7c65-4251-a9ce-6feff919b7cc' }, // text: 'start date', 
			{text: ' plus/minus ' },
			{id: '7d5c5bf9-dcb7-4815-b303-1be5de29523e' }, // text: 'flexible days', 
			{text: ' and ending on ' },
			{id: 'edb9d293-84ca-4a8a-8682-b8c90d2d7e09' }, // text: 'end date', 
			{text: ' plus/minus ' },
			{id: '635c9251-cf7b-47e8-802a-a7552fc64fb7' }, // text: 'flexible days', 
		],
	},
	'5ebdae0f-5913-4eca-857d-51042c4f9095': {
    type: 'prompt',
		text: 'main travel destination',
		children: [
			{text: 'Based on this '},
			{id: 'b6087f54-86da-46af-90ad-52c20822b77b' }, // text: 'list of travel preferences', 
			{text: ' create a list of the top 10 best matching places'},
		]
	},
	'b6087f54-86da-46af-90ad-52c20822b77b': {
    type: 'prompt',
		text: 'list of travel preferences',
		children: [
			{text: 'The general preferences are: warm; mostly sunny; clean air; affordable; yummy food; friendly people;'}
		]
	},
	'2cd38d2e-aa60-4864-92eb-69a7acd2307a': {
    type: 'prompt',
		text: 'list of locations',
		children: [
			{text: 'Based on the single top ranked '},
			{id: '5ebdae0f-5913-4eca-857d-51042c4f9095' }, // text: 'main travel destination', 
			{text: ' create a list of 20 locations that also consider my '},
			{id: 'b6087f54-86da-46af-90ad-52c20822b77b' }, // text: 'list of travel preferences', 
			{text: '.'},
		]
	},
	'3c71b7f8-7c65-4251-a9ce-6feff919b7cc': {
    type: 'prompt',
		text: 'start date',
		children: [
			{text: 'May 1st, 2023'},
		]
	},
	'7d5c5bf9-dcb7-4815-b303-1be5de29523e': {
    type: 'prompt',
		text: 'flexible days',
	},
	'edb9d293-84ca-4a8a-8682-b8c90d2d7e09': {
    type: 'prompt',
		text: 'end date',
		children: [
			{text: 'May 25th, 2023'},
		]
	},
	'635c9251-cf7b-47e8-802a-a7552fc64fb7': {
    type: 'prompt',
		text: 'flexible days',
		children: [
			{text: 'minus 2 days, plus 5 days'},
		]
	},
}