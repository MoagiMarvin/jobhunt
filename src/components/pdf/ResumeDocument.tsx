import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';

// Color Palettes
const THEMES = {
    modern: {
        primary: '#2563EB',
        secondary: '#0F172A',
        accent: '#64748B',
        bg: '#F8FAFC',
        border: '#E2E8F0',
        text: '#334155'
    },
    minimalist: {
        primary: '#000000',
        secondary: '#000000',
        accent: '#666666',
        bg: '#FFFFFF',
        border: '#EEEEEE',
        text: '#333333'
    },
    executive: {
        primary: '#1E293B',
        secondary: '#0F172A',
        accent: '#475569',
        bg: '#FFFFFF',
        border: '#1E293B',
        text: '#1E293B'
    }
};

const getStyles = (themeName: string = 'modern') => {
    const theme = THEMES[themeName as keyof typeof THEMES] || THEMES.modern;

    return StyleSheet.create({
        page: {
            padding: 40,
            backgroundColor: '#FFFFFF',
            fontFamily: 'Helvetica',
        },
        header: {
            marginBottom: 20,
            borderBottom: themeName === 'minimalist' ? 0.5 : 1,
            borderBottomColor: theme.border,
            paddingBottom: 15,
        },
        name: {
            fontSize: 12.5,
            fontWeight: 'bold',
            color: '#000000',
            marginBottom: 2,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        title: {
            fontSize: 9.5,
            color: '#000000',
            fontWeight: 'bold',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        contactGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
        },
        contactItem: {
            fontSize: 9,
            color: '#000000',
        },
        section: {
            marginTop: 10,
            marginBottom: 2,
        },
        sectionTitle: {
            fontSize: 9.5,
            fontWeight: 'bold',
            color: '#000000',
            backgroundColor: '#F8FAFC',
            padding: 2,
            paddingLeft: 4,
            marginBottom: 5,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            borderLeft: 3,
            borderLeftColor: '#000000',
        },
        summaryText: {
            fontSize: 9.5,
            color: '#000000',
            lineHeight: 1.4,
            textAlign: 'justify',
        },
        itemContainer: {
            marginBottom: 8,
        },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 1,
        },
        itemTitle: {
            fontSize: 9.5,
            fontWeight: 'bold',
            color: '#000000',
        },
        itemSubtitle: {
            fontSize: 9.5,
            color: '#000000',
            fontWeight: 'normal',
            marginBottom: 1,
        },
        itemDate: {
            fontSize: 8.5,
            color: '#000000',
            fontWeight: 'bold',
        },
        bulletPoint: {
            fontSize: 9.5,
            color: '#000000',
            marginLeft: 8,
            marginBottom: 1,
            lineHeight: 1.4,
        },
        skillRow: {
            flexDirection: 'row',
            marginBottom: 2,
            alignItems: 'flex-start',
        },
        skillBulletText: {
            fontSize: 9.5,
            color: '#000000',
            marginRight: 6,
            width: 8,
        },
        skillItemText: {
            fontSize: 9.5,
            color: '#000000',
            flex: 1,
            lineHeight: 1.3,
        },
        referenceContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 20,
        },
        referenceItem: {
            width: '45%',
        },
        refName: {
            fontSize: 9,
            fontWeight: 'bold',
            color: '#000000',
        },
        refDetail: {
            fontSize: 8.5,
            color: '#1E293B',
        }
    });
};

export const ResumeDocument = ({ data }: { data: any }) => {
    if (!data) return null;

    const { user, experiences, educationList, skills, projectsList, certificationsList, languages, references, matricData, template = 'modern' } = data;
    const styles = getStyles(template);

    return (
        <Document title={`${user?.name} - Resume`}>
            <Page size="A4" style={styles.page}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.name}>{user?.name}</Text>
                    <Text style={styles.title}>{user?.headline}</Text>
                    <View style={styles.contactGrid}>
                        <Text style={styles.contactItem}>{user?.email}</Text>
                        <Text style={styles.contactItem}>•</Text>
                        <Text style={styles.contactItem}>{user?.phone}</Text>
                        <Text style={styles.contactItem}>•</Text>
                        <Text style={styles.contactItem}>{user?.location}</Text>
                        {user?.linkedin && (
                            <>
                                <Text style={styles.contactItem}>•</Text>
                                <Text style={styles.contactItem}>LinkedIn</Text>
                            </>
                        )}
                    </View>
                    {(user?.haveLicense || user?.haveCar) && (
                        <View style={[styles.contactGrid, { marginTop: 4 }]}>
                            {user?.haveLicense && (
                                <Text style={styles.contactItem}>Driver's License: {user?.licenseCode || 'Yes'}</Text>
                            )}
                            {user?.haveLicense && user?.haveCar && (
                                <Text style={styles.contactItem}>•</Text>
                            )}
                            {user?.haveCar && (
                                <Text style={styles.contactItem}>Own Transport: Yes</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Professional Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Summary</Text>
                    <Text style={styles.summaryText}>{user?.summary}</Text>
                </View>

                {/* Technical Skills */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills & Expertise</Text>
                    <View style={{ marginTop: 2 }}>
                        {skills?.map((s: any, idx: number) => (
                            <View key={idx} style={styles.skillRow}>
                                <Text style={styles.skillBulletText}>•</Text>
                                <Text style={styles.skillItemText}>
                                    {typeof s === 'string' ? s : (s.name || s.skill)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Experience */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Experience</Text>
                    {experiences?.map((exp: any, idx: number) => (
                        <View key={idx} style={styles.itemContainer}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemTitle}>{exp.role}</Text>
                                <Text style={styles.itemDate}>{exp.duration}</Text>
                            </View>
                            <Text style={styles.itemSubtitle}>{exp.company}</Text>
                            <Text style={styles.bulletPoint}>• {exp.description}</Text>
                        </View>
                    ))}
                </View>

                {/* Projects */}
                {projectsList && projectsList.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Key Projects</Text>
                        {projectsList.slice(0, 3).map((project: any, idx: number) => (
                            <View key={idx} style={styles.itemContainer}>
                                <Text style={styles.itemTitle}>{project.title}</Text>
                                <Text style={styles.bulletPoint}>• {project.description}</Text>
                                <Text style={[styles.itemDate, { marginLeft: 10 }]}>Built with: {project.technologies?.join(", ")}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    {educationList?.map((edu: any, idx: number) => (
                        <View key={idx} style={styles.itemContainer}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemTitle}>{edu.title}</Text>
                                <Text style={styles.itemDate}>{edu.date}</Text>
                            </View>
                            <Text style={styles.itemSubtitle}>{edu.issuer}</Text>
                        </View>
                    ))}
                    {matricData && (
                        <View style={styles.itemContainer}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemTitle}>Matric</Text>
                                <Text style={styles.itemDate}>Class of {matricData.completionYear}</Text>
                            </View>
                            <Text style={styles.itemSubtitle}>{matricData.schoolName}</Text>
                        </View>
                    )}
                </View>

                {/* Certifications */}
                {certificationsList && certificationsList.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Certifications & Awards</Text>
                        {certificationsList.map((cert: any, idx: number) => (
                            <View key={idx} style={styles.itemContainer}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{cert.title}</Text>
                                    <Text style={styles.itemDate}>{cert.date}</Text>
                                </View>
                                <Text style={styles.itemSubtitle}>{cert.issuer}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Languages */}
                {languages && languages.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Languages</Text>
                        <View style={styles.contactGrid}>
                            {languages.map((lang: any, idx: number) => (
                                <Text key={idx} style={styles.contactItem}>
                                    {typeof lang === 'string' ? lang : `${lang.language || lang.name}${lang.proficiency || lang.level ? ` (${lang.proficiency || lang.level})` : ''}`}
                                    {idx < languages.length - 1 ? ' • ' : ''}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}

                {/* References */}
                {references && references.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional References</Text>
                        <View style={styles.referenceContainer}>
                            {references.map((ref: any, idx: number) => (
                                <View key={idx} style={styles.referenceItem}>
                                    <Text style={styles.refName}>{ref.name}</Text>
                                    <Text style={styles.refDetail}>{ref.relationship} at {ref.company}</Text>
                                    <Text style={styles.refDetail}>{ref.email} | {ref.phone}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
};
