import { useEffect, useRef } from 'react';

/**
 * A hook that allows the browser's back button to close a modal/drawer
 * instead of navigating to the previous page.
 * 
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Function to call to close the modal
 */
export function useBackToClose(isOpen: boolean, onClose: () => void) {
    const isPushed = useRef(false);

    useEffect(() => {
        if (isOpen) {
            // Push a new state when the modal opens
            window.history.pushState({ modalOpen: true }, '');
            isPushed.current = true;

            const handlePopState = () => {
                // When user clicks back, this will be triggered
                isPushed.current = false;
                onClose();
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
                // If the component unmounts or isOpen becomes false manually,
                // we should remove the pushed history state if it's still there
                if (isPushed.current) {
                    window.history.back();
                    isPushed.current = false;
                }
            };
        }
    }, [isOpen, onClose]);
}
