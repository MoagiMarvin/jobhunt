import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';

// Register a cleaner font if needed, or use defaults
// Standard PDF fonts: Helvetica, Times-Roman, Courier

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 12,
        color: '#2563EB',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    contactGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    contactItem: {
        fontSize: 9,
        color: '#64748B',
    },
    section: {
        marginTop: 15,
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0F172A',
        backgroundColor: '#F8FAFC',
        padding: 4,
        paddingLeft: 8,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        borderLeft: 3,
        borderLeftColor: '#2563EB',
    },
    summaryText: {
        fontSize: 10,
        color: '#334155',
        lineHeight: 1.5,
        textAlign: 'justify',
    },
    itemContainer: {
        marginBottom: 10,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    itemTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    itemSubtitle: {
        fontSize: 10,
        color: '#2563EB',
        fontWeight: 'medium',
    },
    itemDate: {
        fontSize: 9,
        color: '#94A3B8',
    },
    bulletPoint: {
        fontSize: 9,
        color: '#475569',
        marginLeft: 10,
        marginBottom: 2,
        lineHeight: 1.3,
    },
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    skillBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#DBEAFE',
    },
    skillText: {
        fontSize: 8,
        color: '#1E40AF',
        fontWeight: 'bold',
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
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    refDetail: {
        fontSize: 8,
        color: '#64748B',
    }
});

export const ResumeDocument = ({ data }: { data: any }) => {
    if (!data) return null;

    const { user, experiences, educationList, skills, projectsList, certificationsList, languages, references, matricData } = data;

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
                </View>

                {/* Professional Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Summary</Text>
                    <Text style={styles.summaryText}>{user?.summary}</Text>
                </View>

                {/* Technical Skills */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Technical Skills</Text>
                    <View style={styles.skillsGrid}>
                        {skills?.map((skill: any, idx: number) => (
                            <View key={idx} style={styles.skillBadge}>
                                <Text style={styles.skillText}>
                                    {typeof skill === 'string' ? skill : skill.name}
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
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Projects</Text>
                    {projectsList?.slice(0, 3).map((project: any, idx: number) => (
                        <View key={idx} style={styles.itemContainer}>
                            <Text style={styles.itemTitle}>{project.title}</Text>
                            <Text style={styles.bulletPoint}>• {project.description}</Text>
                            <Text style={[styles.itemDate, { marginLeft: 10 }]}>Built with: {project.technologies?.join(", ")}</Text>
                        </View>
                    ))}
                </View>

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
                                <Text style={styles.itemTitle}>Matric / National Senior Certificate</Text>
                                <Text style={styles.itemDate}>Class of {matricData.completionYear}</Text>
                            </View>
                            <Text style={styles.itemSubtitle}>{matricData.schoolName}</Text>
                            <Text style={styles.bulletPoint}>• {matricData.distinctions_count || matricData.distinctionsCount} Distinctions</Text>
                        </View>
                    )}
                </View>

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
