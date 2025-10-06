import { notification } from "antd";

notification.config({
    top: 50,
    duration: 3,
    placement: "topRight"
});

export const errorNotification = (message: string, description: string) => {
    notification.error({
        message,
        description,
    });
};

export const infoNotification = (message: string, description: string) => {
    notification.info({
        message,
        description,
    });
};

export const successNotification = (message: string, description: string) => {
    notification.success({
        message,
        description,
    });
};

export const warningNotification = (message: string, description: string) => {
    notification.warning({
        message,
        description,
    });
};
