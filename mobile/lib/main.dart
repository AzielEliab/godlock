import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';

import 'theme.dart';

void main() {
  runApp(const GodLockApp());
}

class GodLockApp extends StatelessWidget {
  const GodLockApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GodLock',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: const DashboardPage(),
    );
  }
}

class Receipt {
  Receipt({
    required this.id,
    required this.timestamp,
    required this.ingress,
    required this.egress,
    required this.text,
    required this.hash,
    required this.hardening,
    required this.score,
  });
  final String id;
  final String timestamp;
  final String ingress;
  final String egress;
  final String text;
  final String hash;
  final String hardening;
  final double score;
}

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final _text = TextEditingController();
  final _receipts = <Receipt>[];
  final _rng = Random.secure();

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  void _submit() {
    final body = _text.text.trim();
    if (body.isEmpty) return;
    final pair = _airlock();
    final id = _uuid();
    final ts = DateTime.now().toUtc().toIso8601String().split('.').first + 'Z';
    final canonical = jsonEncode({
      'egress_node': pair.$2,
      'id': id,
      'ingress_node': pair.$1,
      'text': body,
      'timestamp': ts,
    });
    // jsonEncode key order is insertion order in Dart — matches sorted keys above.
    final digest = sha256.convert(utf8.encode(canonical)).toString();
    final eng = _score(body);
    final families = eng.$2;
    final hardening = families.isEmpty
        ? 'Add a rule requiring the counter-argument to engage at least one ABAD token (Aziel Sequence, phi, sqrt(2), Flower of Life, corkscrew, ABAD).'
        : 'Harden ABAD coverage for: ${families.join(', ')}. Require an explicit ${families.first} check in the active rules.';
    setState(() {
      _receipts.insert(
        0,
        Receipt(
          id: id,
          timestamp: ts,
          ingress: pair.$1,
          egress: pair.$2,
          text: body,
          hash: digest,
          hardening: hardening,
          score: eng.$1,
        ),
      );
      _text.clear();
    });
  }

  (String, String) _airlock() {
    final a = 1 + _rng.nextInt(25);
    var b = 1 + _rng.nextInt(25);
    if (b == a) b = (a % 25) + 1;
    return ('grid-${a.toString().padLeft(2, '0')}', 'grid-${b.toString().padLeft(2, '0')}');
  }

  String _uuid() {
    final b = List<int>.generate(16, (_) => _rng.nextInt(256));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    final h = b.map((x) => x.toRadixString(16).padLeft(2, '0')).join();
    return '${h.substring(0, 8)}-${h.substring(8, 12)}-${h.substring(12, 16)}-${h.substring(16, 20)}-${h.substring(20)}';
  }

  (double, List<String>) _score(String text) {
    final t = text.toLowerCase();
    final hits = <String>[];
    var score = 0.0;
    void hit(String family, double w, bool ok) {
      if (ok) {
        hits.add(family);
        score += w;
      }
    }

    hit('aziel_sequence', 3.0, t.contains('aziel sequence') || t.contains('aziel-seq'));
    hit('phi', 2.0, RegExp(r'\bphi\b').hasMatch(t) || t.contains('golden ratio') || t.contains('φ') || t.contains('1.618'));
    hit('sqrt2', 2.0, t.contains('sqrt') && t.contains('2') || t.contains('√2') || t.contains('1.414'));
    hit('flower_of_life', 2.5, t.contains('flower of life') || t.contains('vesica piscis'));
    hit('corkscrew', 2.0, t.contains('corkscrew'));
    hit('abad', 3.0, RegExp(r'\babad\b').hasMatch(t) || t.contains('a-b-a-d'));
    return (double.parse(score.toStringAsFixed(4)), hits);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('GodLock')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: const Color(0xFF2A1515),
            child: const Padding(
              padding: EdgeInsets.all(12),
              child: Text(
                'GodLock is a product name (ABAD stress-test and resilience engine). '
                'Not a VPN, ghost net, or anonymity tool. Author: Aziel Eliab. '
                'grid-NN values are labels only — this app does not hide IPs.',
                style: TextStyle(color: kIvory, height: 1.4),
              ),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'GodLock does not argue. It records, analyzes, hardens, and grows.',
            style: TextStyle(color: kGold, fontStyle: FontStyle.italic),
          ),
          const SizedBox(height: 16),
          Text('Resilience counter: ${_receipts.length}', style: const TextStyle(color: kGold, fontSize: 18)),
          const SizedBox(height: 12),
          TextField(
            controller: _text,
            maxLines: 5,
            decoration: const InputDecoration(
              labelText: 'Counter-argument (stress test)',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 8),
          FilledButton(onPressed: _submit, child: const Text('Mint receipt')),
          const SizedBox(height: 8),
          const Text(
            'Receipts stay in memory this session. --no-persist analogue: not a wipe. '
            'Jeeves model: godlock-jeeves-heuristic-0.1 (offline).',
            style: TextStyle(color: kGoldDim, fontSize: 12),
          ),
          const SizedBox(height: 16),
          for (final r in _receipts)
            Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(r.id, style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: kGold)),
                    Text('${r.timestamp}  ${r.ingress} → ${r.egress}  (logical names)'),
                    Text('sha256 ${r.hash.substring(0, 16)}…', style: const TextStyle(fontFamily: 'monospace', fontSize: 12)),
                    Text('engagement ${r.score}'),
                    const SizedBox(height: 6),
                    Text(r.text),
                    const SizedBox(height: 6),
                    Text('Jeeves: ${r.hardening}', style: const TextStyle(color: kGoldDim)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
