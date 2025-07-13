import * as fs from 'fs';
import { logger } from '../shared/logger';

const MAX_DEPTH = 10;

export async function identifyAncestor(workspacePath: string, possibleAncestors: string[]): Promise<string> {
    const git = await import('isomorphic-git');
    const currentBranch = await git.currentBranch({ fs, dir: workspacePath });

    logger.info(`🌳 Git detective work: On branch '${currentBranch}', hunting for ancestors: [${possibleAncestors.join(', ')}]`);
    if (!currentBranch) { throw new Error('Git is being mysterious - can\'t figure out which branch we\'re on 🕵️'); }
    if (possibleAncestors.includes(currentBranch)) { 
        logger.info(`🎯 Git: Bingo! Current branch '${currentBranch}' is exactly what we're looking for`);
        return currentBranch; 
    }

    for (const ancestor of possibleAncestors) {
        const isDescendant = await isDescendaetOf(workspacePath, currentBranch, ancestor);
        if (isDescendant) { 
            logger.info(`🔍 Git: Eureka! Found ancestor '${ancestor}' for branch '${currentBranch}' - family tree complete!`);
            return ancestor; 
        }
    }

    const error = `Branch '${currentBranch}' seems to be an orphan - no family connections found after searching ${MAX_DEPTH} levels deep 👻`;
    logger.error(`😱 Git family tree mystery: ${error}`);
    throw new Error(error);
}

async function isDescendaetOf(dir: string, branch: string, parentBranch: string): Promise<boolean> {
    const git = await import('isomorphic-git');
    const branchOid = await git.resolveRef({ fs, dir, ref: branch });
    const parentOid = await git.resolveRef({ fs, dir, ref: parentBranch });
    if (branchOid === parentOid) { return true; }
    try {
        return await git.isDescendent({ fs, dir, oid: branchOid, ancestor: parentOid, depth: MAX_DEPTH});
    } catch (error: any) {
        if (error.code === 'MaxDepthError') {
            return false;
        } else { throw error; }
    }
}