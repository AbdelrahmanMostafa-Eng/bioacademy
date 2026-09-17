import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10 },
  title: { fontSize: 16, color: '#206682', marginBottom: 4, fontWeight: 700 },
  sub: { fontSize: 10, color: '#666', marginBottom: 16 },
  row: { flexDirection: 'row', borderBottom: '0.5 solid #eee', paddingVertical: 6 },
  cell: { flex: 1 },
  headerRow: { flexDirection: 'row', borderBottom: '1 solid #206682', paddingBottom: 6, marginBottom: 4 },
  headerCell: { flex: 1, fontWeight: 700, color: '#206682' },
})

export default function AttendanceReport({ courseTitle, sessionDate, rows }: {
  courseTitle: string
  sessionDate: string
  rows: { name: string; status: string; excuse: string }[]
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Bioacademy — Attendance Report</Text>
        <Text style={styles.sub}>{courseTitle} · {sessionDate}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerCell}>Student</Text>
          <Text style={styles.headerCell}>Status</Text>
          <Text style={styles.headerCell}>Excuse</Text>
        </View>
        {rows.map((r, i) => (
          <View style={styles.row} key={i}>
            <Text style={styles.cell}>{r.name}</Text>
            <Text style={styles.cell}>{r.status}</Text>
            <Text style={styles.cell}>{r.excuse}</Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}
