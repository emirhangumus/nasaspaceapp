'use client';

import { useEffect, useState } from "react";
import { subscribeUser, unsubscribeUser } from "./actions";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function PushNotificationManager({ userId, isSub }: { userId: string, isSub: boolean }) {
    const [subscribed, setSubscribed] = useState(isSub)
    const [isSupported, setIsSupported] = useState(false)

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            registerServiceWorker()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * this is for, when the user is already subscribed to push notifications
     */
    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        })
        const sub = await registration.pushManager.getSubscription()
        if (sub) await subscribeUser(sub, userId)
    }

    async function subscribeToPush() {
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
            ),
        })

        await subscribeUser(sub, userId)
        setSubscribed(true)
    }

    async function unsubscribeFromPush() {
        await unsubscribeUser(userId)
        setSubscribed(false)
    }

    if (!isSupported) {
        return null
    }

    return (
        <div>
            {subscribed ? (
                <Button
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={unsubscribeFromPush}
                >
                    Unsubscribe
                </Button>
            ) : (
                <Button
                    className="bg-green-500 text-white hover:bg-green-600"
                    onClick={subscribeToPush}
                >
                    Subscribe
                </Button>
            )}
        </div>
    );
}
