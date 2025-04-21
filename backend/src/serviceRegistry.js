const REGISTRY_URL = process.env.REGISTRY_URL;
const SERVICE_URL = process.env.SERVICE_URL;

/**
 * Handles registering with Service Registry in cluster mode.
 */
class ServiceRegistry {
	enabled = false;
	modelManager;

	constructor(modelManager) {
		this.enabled = !!REGISTRY_URL;
		this.modelManager = modelManager;
	}

	/**
	 * Register this service with the registry
	 */
	async register() {
		if (!this.enabled) return;

		try {
			const models = this.modelManager.availableModels.map(model => ({
				name: model.name,
				type: model.type
			}));

			console.log(`Registering with registry at ${REGISTRY_URL} with ${models.length} models`);

			const response = await fetch(`${REGISTRY_URL}/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					url: SERVICE_URL,
					models: models
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				console.error(`Failed to register with registry: ${error}`);

				// Retry registration after delay
				setTimeout(this.register, 10000);
			}
		} catch (error) {
			console.error('Error registering with registry:', error);

			// Retry registration after delay
			setTimeout(this.register, 10000);
		}
	}

	/**
	 * Unregister this service from the registry
	 */
	async unregister() {
		if (!this.enabled) return;

		try {
			console.log(`Unregistering from registry at ${REGISTRY_URL}`);

			const response = await fetch(`${REGISTRY_URL}/unregister`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					url: SERVICE_URL
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				console.error(`Failed to unregister from registry: ${error}`);
			}
		} catch (error) {
			console.error('Error unregistering from registry:', error);
		}
	}
}

module.exports = ServiceRegistry;
