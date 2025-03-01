import PocketBase from 'pocketbase';
import type { AuthModel } from 'pocketbase';
import { writable } from 'svelte/store'
import type { User, BusinessAccount } from '../types/accounts';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
pb.autoCancellation(false);
export const currentUser = writable<User | null>(pb.authStore.model);
pb.authStore.onChange((auth) => {
    console.log('authStore changed', auth);
    currentUser.set(pb.authStore.model);
});
console.log('PocketBase URL:', pb.baseUrl);
export async function checkPocketBaseConnection() {
    try {
        const health = await pb.health.check();
        console.log('PocketBase health check:', health);
        return true;
    } catch (error) {
        console.error('PocketBase connection error:', error);
        return false;
    }
}
export async function ensureAuthenticated(): Promise<boolean> {
    console.log('Checking authentication...');
    console.log('Current auth model:', pb.authStore.model);
    console.log('Is auth valid?', pb.authStore.isValid);

    if (!pb.authStore.isValid) {
        console.log('Auth token is invalid. Attempting to refresh...');
        try {
            const authData = await pb.collection('users').authRefresh();
            console.log('Auth token refreshed successfully');
            console.log('New auth model:', pb.authStore.model);
            console.log('Auth refreshed:', authData);
            return true;
        } catch (error) {
            console.error('Failed to refresh auth token:', error);
            pb.authStore.clear();
            return false;
        }
    }
    return true;
}
export async function signUp(email: string, password: string): Promise<User | null> {
    try {
        const user = await pb.collection('users').create<User>({
            email,
            password,
            passwordConfirm: password
        });
        return user;
    } catch (error) {
        console.error('Sign-up error:', error instanceof Error ? error.message : String(error));
        return null;
    }
}
export async function signIn(email: string, password: string): Promise<AuthModel | null> {
    try {
        const authData = await pb.collection('users').authWithPassword<User>(email, password);
        return authData;
    } catch (error) {
        console.error('Sign-in error:', error instanceof Error ? error.message : String(error));
        return null;
    }
}
export function signOut() {
    pb.authStore.clear();
    currentUser.set(null);
}
export async function updateUser(id: string, userData: FormData | Partial<User>): Promise<User> {
    const record = await pb.collection('users').update(id, userData);
    return record as User;
}
export async function getUserById(id: string): Promise<User | null> {
    try {
        const record = await pb.collection('users').getOne(id);
        return record as User;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}
export function unsubscribeFromChanges(unsubscribe: () => void): void {
    unsubscribe();
}


