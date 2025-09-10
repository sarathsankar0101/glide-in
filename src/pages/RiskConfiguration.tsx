import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiskCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  weight: number;
  dataType: string;
}

interface RiskCategory {
  id: string;
  name: string;
  conditions: RiskCondition[];
  totalWeight: number;
  status: 'incomplete' | 'complete';
}

const RiskConfiguration = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('financial');
  
  const fieldOptions = {
    financial: [
      { name: 'Loan Amount', dataType: 'Number' },
      { name: 'Outstanding Balance', dataType: 'Number' },
      { name: 'Days Past Due (DPD)', dataType: 'Number' },
      { name: 'Repayment History Score', dataType: 'Number' },
      { name: 'Previous Defaults (count)', dataType: 'Number' },
      { name: 'Cost-to-Collect Estimate', dataType: 'Number' }
    ],
    identity: [
      { name: 'Name Match %', dataType: 'Percentage' },
      { name: 'Address Match %', dataType: 'Percentage' },
      { name: 'DOB Match', dataType: 'Boolean' },
      { name: 'National Insurance Number Match', dataType: 'Boolean' }
    ],
    property: [
      { name: 'Years at Current Address', dataType: 'Number' },
      { name: 'Property Owned (Yes/No)', dataType: 'Boolean' },
      { name: 'Property Value', dataType: 'Number' },
      { name: 'Vehicle Owned (Yes/No)', dataType: 'Boolean' }
    ],
    contactability: [
      { name: 'Contact Numbers Available (count)', dataType: 'Number' },
      { name: 'Validated Phone Number (Yes/No)', dataType: 'Boolean' },
      { name: 'Number of Contactable Channels', dataType: 'Number' },
      { name: 'Agent Recovery Success Rate', dataType: 'Percentage' }
    ],
    risk: [
      { name: 'Criminal Record Flag (Yes/No)', dataType: 'Boolean' },
      { name: 'Recent Missed Payments', dataType: 'Number' }
    ]
  };

  const getAvailableFields = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    const usedFields = category?.conditions.map(c => c.field) || [];
    return fieldOptions[categoryId as keyof typeof fieldOptions]?.filter(
      field => !usedFields.includes(field.name)
    ) || [];
  };

  const getOperatorsForDataType = (dataType: string) => {
    switch (dataType) {
      case 'Boolean':
        return [{ value: '=', label: '=' }];
      case 'Text':
        return [
          { value: '=', label: '=' },
          { value: '!=', label: '!=' }
        ];
      case 'Number':
      case 'Percentage':
        return [
          { value: '>', label: '>' },
          { value: '<', label: '<' },
          { value: '=', label: '=' },
          { value: '>=', label: '≥' },
          { value: '<=', label: '≤' }
        ];
      default:
        return [
          { value: '>', label: '>' },
          { value: '<', label: '<' },
          { value: '=', label: '=' }
        ];
    }
  };

  const getValueInput = (condition: RiskCondition, onUpdate: (value: string) => void) => {
    const { dataType, value } = condition;
    
    if (dataType === 'Boolean') {
      return (
        <Select value={value} onValueChange={onUpdate}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    if (dataType === 'Percentage') {
      return (
        <div className="relative">
          <Input
            type="number"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="0-100"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">%</span>
        </div>
      );
    }
    
    return (
      <Input
        type={dataType === 'Number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={dataType === 'Number' ? '0' : 'Enter value'}
      />
    );
  };
  
  const [categories, setCategories] = useState<RiskCategory[]>([
    {
      id: 'financial',
      name: 'Financial & Credit',
      conditions: [
        { id: '1', field: 'Loan Amount', operator: '>', value: '5000', weight: 40, dataType: 'Number' },
        { id: '2', field: 'Outstanding Balance', operator: '=', value: '1500', weight: 15, dataType: 'Number' }
      ],
      totalWeight: 55,
      status: 'incomplete'
    },
    {
      id: 'identity',
      name: 'Identity & Verification',
      conditions: [],
      totalWeight: 0,
      status: 'incomplete'
    },
    {
      id: 'property',
      name: 'Property & Stability',
      conditions: [],
      totalWeight: 0,
      status: 'incomplete'
    },
    {
      id: 'contactability',
      name: 'Contactability & Behaviour',
      conditions: [],
      totalWeight: 0,
      status: 'incomplete'
    },
    {
      id: 'risk',
      name: 'Risk Factors',
      conditions: [],
      totalWeight: 0,
      status: 'incomplete'
    }
  ]);

  const activeCategory = categories.find(cat => cat.id === activeTab);

  const addCondition = () => {
    if (!activeCategory) return;
    
    const newCondition: RiskCondition = {
      id: Date.now().toString(),
      field: '',
      operator: '>',
      value: '',
      weight: 0,
      dataType: 'Number'
    };

    setCategories(prev => prev.map(cat => 
      cat.id === activeTab 
        ? { ...cat, conditions: [...cat.conditions, newCondition] }
        : cat
    ));
  };

  const removeCondition = (conditionId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === activeTab 
        ? { 
            ...cat, 
            conditions: cat.conditions.filter(c => c.id !== conditionId),
            totalWeight: cat.conditions
              .filter(c => c.id !== conditionId)
              .reduce((sum, c) => sum + c.weight, 0)
          }
        : cat
    ));
  };

  const updateCondition = (conditionId: string, field: keyof RiskCondition, value: any) => {
    setCategories(prev => prev.map(cat => 
      cat.id === activeTab 
        ? { 
            ...cat, 
            conditions: cat.conditions.map(c => 
              c.id === conditionId ? { ...c, [field]: value } : c
            ),
            totalWeight: cat.conditions
              .map(c => c.id === conditionId ? { ...c, [field]: value } : c)
              .reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
          }
        : cat
    ));
  };

  const saveRules = () => {
    // Store the categories in localStorage to persist across sessions
    localStorage.setItem('riskCategories', JSON.stringify(categories));
    
    toast({
      title: "Rules Saved",
      description: "Risk assessment configuration has been saved successfully. Dashboard will reflect these changes.",
    });
  };

  const previewRules = () => {
    toast({
      title: "Rules Preview",
      description: "Opening rules preview...",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Risk Assessment Configuration</h1>
        <p className="text-muted-foreground">Configure scoring rules and conditions for risk assessment</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === category.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Active Category Content */}
      {activeCategory && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{activeCategory.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define conditions and weights for this category
              </p>
            </div>
            <Badge variant={activeCategory.totalWeight === 100 ? "default" : "destructive"}>
              Total: {activeCategory.totalWeight}%
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCategory.conditions.map((condition) => (
              <div key={condition.id} className="flex items-end gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <Label>Field</Label>
                  <Select
                    value={condition.field}
                    onValueChange={(value) => {
                      const selectedField = fieldOptions[activeTab as keyof typeof fieldOptions]?.find(f => f.name === value);
                      updateCondition(condition.id, 'field', value);
                      if (selectedField) {
                        updateCondition(condition.id, 'dataType', selectedField.dataType);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableFields(activeTab).map((field) => (
                        <SelectItem key={field.name} value={field.name}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label>Operator</Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=">">{">"}</SelectItem>
                      <SelectItem value="<">{"<"}</SelectItem>
                      <SelectItem value="=">=</SelectItem>
                      <SelectItem value=">=">{"≥"}</SelectItem>
                      <SelectItem value="<=">{"≤"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Label>Value</Label>
                  <Input
                    value={condition.value}
                    onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div className="w-20">
                  <Label>Weight %</Label>
                  <Input
                    type="number"
                    value={condition.weight}
                    onChange={(e) => updateCondition(condition.id, 'weight', Number(e.target.value))}
                    placeholder="40"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(condition.id)}
                  className="text-destructive hover:text-destructive h-10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addCondition}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>

            <div className="text-sm text-muted-foreground">
              {activeCategory.conditions.length} conditions configured
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            Overview of all configured scoring rules
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="text-center p-4 border rounded-lg">
                <h3 className="font-medium text-sm">{category.name}</h3>
                <div className="text-2xl font-bold mt-2">{category.conditions.length}</div>
                <p className="text-xs text-muted-foreground">Weight: {category.totalWeight}%</p>
                <Badge 
                  variant={category.status === 'complete' ? "default" : "secondary"}
                  className="mt-2"
                >
                  {category.status === 'complete' ? 'Complete' : 'Incomplete'}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={previewRules} variant="outline">
              Preview Rules
            </Button>
            <Button onClick={saveRules}>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskConfiguration;