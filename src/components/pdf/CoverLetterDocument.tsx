import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 50,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        borderBottom: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 20,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    contactInfo: {
        fontSize: 10,
        color: '#666666',
        lineHeight: 1.5,
    },
    date: {
        fontSize: 11,
        marginBottom: 20,
        color: '#333333',
    },
    recipient: {
        fontSize: 11,
        marginBottom: 25,
        lineHeight: 1.4,
        color: '#000000',
    },
    body: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#333333',
        textAlign: 'justify',
    },
    signature: {
        marginTop: 40,
        fontSize: 11,
        color: '#000000',
    }
});

interface CoverLetterProps {
    content: string;
    personalInfo: {
        name: string;
        email: string;
        phone: string;
        location: string;
    };
}

const CoverLetterDocument: React.FC<CoverLetterProps> = ({ content, personalInfo }) => {
    const today = new Date().toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{personalInfo.name}</Text>
                    <Text style={styles.contactInfo}>
                        {personalInfo.location} | {personalInfo.phone} | {personalInfo.email}
                    </Text>
                </View>

                {/* Date */}
                <Text style={styles.date}>{today}</Text>

                {/* Content */}
                <View>
                    <Text style={styles.body}>{content}</Text>
                </View>

                {/* Signature */}
                <View style={styles.signature}>
                    <Text>Sincerely,</Text>
                    <Text style={{ marginTop: 10, fontWeight: 'bold' }}>{personalInfo.name}</Text>
                </View>
            </Page>
        </Document>
    );
};

export default CoverLetterDocument;
