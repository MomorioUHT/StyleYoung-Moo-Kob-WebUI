import { notification } from "antd";

/**
 * Global notification configuration
 * Sets default position, duration, and placement for all notifications
 */
notification.config({
    top: 50,
    duration: 3,
    placement: "topRight"
});

/**
 * Displays an error notification
 * 
 * @param {string} message - The main notification title
 * @param {string} description - Detailed description of the error
 */
export const errorNotification = (message: string, description: string) => {
    notification.error({
        message,
        description,
    });
};

/**
 * Displays an informational notification
 * 
 * @param {string} message - The main notification title
 * @param {string} description - Detailed information message
 */
export const infoNotification = (message: string, description: string) => {
    notification.info({
        message,
        description,
    });
};

/**
 * Displays a success notification
 * 
 * @param {string} message - The main notification title
 * @param {string} description - Detailed success message
 */
export const successNotification = (message: string, description: string) => {
    notification.success({
        message,
        description,
    });
};

/**
 * Displays a warning notification
 * 
 * @param {string} message - The main notification title
 * @param {string} description - Detailed warning message
 */
export const warningNotification = (message: string, description: string) => {
    notification.warning({
        message,
        description,
    });
};
