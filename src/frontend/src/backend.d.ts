import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Username = string;
export interface backendInterface {
    login(username: Username, password: string): Promise<boolean>;
    register(username: Username, password: string): Promise<boolean>;
}
