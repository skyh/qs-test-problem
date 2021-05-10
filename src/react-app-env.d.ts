/// <reference types="react-scripts" />

declare module "*.module.sass" {
    declare const styles: Record<string, string>
    export default styles
}
