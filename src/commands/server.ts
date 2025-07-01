import { ConfigServerManager } from '../service/configServerManager';

export function handleSelectServer() {
	return ConfigServerManager.getInstance().selectServer();
}

export function handlePinServer() {
	return ConfigServerManager.getInstance().pinCurrentServer();
}

export function handleUnpinServer() {
	return ConfigServerManager.getInstance().unpinServer();
}