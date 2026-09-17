import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 60, alignItems: 'center', justifyContent: 'center' },
  border: { borderWidth: 3, borderColor: '#206682', padding: 40, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 12, color: '#8a5a00', letterSpacing: 3, marginBottom: 20 },
  name: { fontSize: 28, color: '#206682', fontWeight: 700, marginBottom: 12 },
  body: { fontSize: 13, color: '#444', textAlign: 'center', marginBottom: 20 },
  course: { fontSize: 16, color: '#206682', fontWeight: 700, marginBottom: 30 },
  date: { fontSize: 11, color: '#888' },
})

export default function Certificate({ studentName, courseTitle, date }: { studentName: string; courseTitle: string; date: string }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.title}>CERTIFICATE OF COMPLETION</Text>
          <Text style={styles.name}>{studentName}</Text>
          <Text style={styles.body}>has successfully completed</Text>
          <Text style={styles.course}>{courseTitle}</Text>
          <Text style={styles.date}>Bioacademy · {date}</Text>
        </View>
      </Page>
    </Document>
  )
}
