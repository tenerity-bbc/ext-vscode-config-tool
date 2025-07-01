import { ServerManager } from '../service/serverManager';

export function handleSelectServer() {
	return ServerManager.getInstance().selectServer();
}

export function handlePinServer() {
	return ServerManager.getInstance().pinCurrentServer();
}

export function handleUnpinServer() {
	return ServerManager.getInstance().unpinServer();
}