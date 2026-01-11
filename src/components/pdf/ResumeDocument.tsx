import React from 'react';
import { Document, Page, Text } from '@react-pdf/renderer';

export const ResumeDocument = (props: any) => {
    console.log("ResumeDocument Props:", props);
    return (
        <Document>
            <Page>
                <Text>Isolation Test - If you see this, the props are the issue.</Text>
            </Page>
        </Document>
    );
};
