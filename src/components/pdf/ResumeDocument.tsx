import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Link } from '@react-pdf/renderer';

// Register a nice font (optional, using standard Helvetica for now for reliability)
// Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
        color: '#333333'
    },
    header: {
        marginBottom: 20,
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: 20
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    headline: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 8
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        fontSize: 10,
        color: '#475569'
    },
    section: {
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2563EB', // Primary Blue
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    expItem: {
        marginBottom: 10
    },
    expHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2
    },
    role: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1E293B'
    },
    company: {
        fontSize: 11,
        color: '#475569'
    },
    date: {
        fontSize: 10,
        color: '#94A3B8'
    },
    description: {
        fontSize: 10,
        marginTop: 4,
        lineHeight: 1.4,
        color: '#334155'
    },
    skillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5
    },
    skillTag: {
        fontSize: 9,
        backgroundColor: '#F1F5F9',
        padding: '4 8',
        borderRadius: 4,
        color: '#475569'
    },
    link: {
        color: '#2563EB',
        textDecoration: 'none'
    }
});

interface ResumeProps {
    user: any;
    experiences: any[];
    educationList: any[];
    skills: string[];
    projectsList: any[];
    certificationsList: any[];
}

export const ResumeDocument = ({ user, experiences, educationList, skills, projectsList, certificationsList }: ResumeProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.headline}>{user.headline}</Text>

                <View style={styles.contactRow}>
                    {user.email && <Text>{user.email}</Text>}
                    {user.phone && <Text>• {user.phone}</Text>}
                    {user.location && <Text>• {user.location}</Text>}
                </View>

                <View style={{ ...styles.contactRow, marginTop: 5 }}>
                    {user.linkedin && <Link src={user.linkedin} style={styles.link}>LinkedIn</Link>}
                    {user.github && <Link src={user.github} style={styles.link}>GitHub</Link>}
                    {user.portfolio && <Link src={user.portfolio} style={styles.link}>Portfolio</Link>}
                </View>

                {/* Logistics Badges as text for PDF */}
                <View style={{ ...styles.contactRow, marginTop: 5 }}>
                    {user.haveLicense && <Text style={{ color: '#7C3AED', fontSize: 9 }}>✓ Driver's License</Text>}
                    {user.haveCar && <Text style={{ color: '#2563EB', fontSize: 9 }}>✓ Own Transport</Text>}
                </View>
            </View>

            {/* Experience */}
            {experiences.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    {experiences.map((exp: any, i: number) => (
                        <View key={i} style={styles.expItem}>
                            <View style={styles.expHeader}>
                                <Text style={styles.role}>{exp.role}</Text>
                                <Text style={styles.date}>{exp.duration}</Text>
                            </View>
                            <Text style={styles.company}>{exp.company}</Text>
                            <Text style={styles.description}>{exp.description}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Projects */}
            {projectsList.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Projects</Text>
                    {projectsList.map((project: any, i: number) => (
                        <View key={i} style={styles.expItem}>
                            <View style={styles.expHeader}>
                                <Text style={styles.role}>{project.title}</Text>
                            </View>
                            <Text style={styles.description}>{project.description}</Text>
                            <Text style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>
                                Tech: {project.technologies.join(', ')}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                                {project.github_url && <Link src={project.github_url} style={{ fontSize: 9, color: '#2563EB' }}>Code</Link>}
                                {project.link_url && <Link src={project.link_url} style={{ fontSize: 9, color: '#2563EB' }}>Demo</Link>}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Education */}
            {educationList.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    {educationList.map((edu: any, i: number) => (
                        <View key={i} style={styles.expItem}>
                            <View style={styles.expHeader}>
                                <Text style={styles.role}>{edu.title}</Text>
                                <Text style={styles.date}>{edu.date}</Text>
                            </View>
                            <Text style={styles.company}>{edu.issuer}</Text>
                            {edu.grade && <Text style={{ fontSize: 10, color: '#64748B' }}>Grade: {edu.grade}</Text>}
                        </View>
                    ))}
                </View>
            )}

            {/* Certifications (Merged with Education logic if needed, but separate here) */}
            {certificationsList.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Certifications</Text>
                    {certificationsList.map((cert: any, i: number) => (
                        <View key={i} style={styles.expItem}>
                            <View style={styles.expHeader}>
                                <Text style={styles.role}>{cert.title}</Text>
                                <Text style={styles.date}>{cert.date}</Text>
                            </View>
                            <Text style={styles.company}>{cert.issuer}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View style={styles.skillRow}>
                        {skills.map((skill, i) => (
                            <Text key={i} style={styles.skillTag}>{skill}</Text>
                        ))}
                    </View>
                </View>
            )}
        </Page>
    </Document>
);
